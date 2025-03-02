import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from torch.utils.data import DataLoader, Dataset
from tqdm import tqdm
import os
import sys

today = sys.argv[1]
lastScrape = sys.argv[2]


# Load dataset
df = pd.read_csv('merged_tweets.csv')
df = df.iloc[lastScrape:]  # Process only from lastScrape index to the latest

# Detect device (GPU if available, else CPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
num_gpus = torch.cuda.device_count()
print(f"🔥 Using {device} ({num_gpus} GPUs available)")

# Load Sentiment Model
model_name = 'ProsusAI/finbert'
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Move model to appropriate device
if num_gpus > 1:
    model = torch.nn.DataParallel(model)
model.to(device)

# Auto-select batch size based on available resources
batch_size = 64 if device.type == "cuda" else 16  # Reduce batch size for CPU
print(f"⚡ Auto-selected batch size: {batch_size}")

# Dataset Class for Efficient Batching
class TweetDataset(Dataset):
    def __init__(self, texts, tokenizer, max_length=128):
        self.texts = texts
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(
            self.texts[idx], 
            max_length=self.max_length, 
            padding="max_length", 
            truncation=True, 
            return_tensors="pt"
        )
        return {key: val.squeeze(0) for key, val in encoding.items()}

# Create DataLoader
dataset = TweetDataset(df['Text'].astype(str).tolist(), tokenizer)
dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=False)

# Output File Config
output_file = 'tweets_with_all_features.csv'
save_interval = 50000  # Save every 50K rows to avoid memory overflow
all_results = []

# Process tweets in batches on available device
with torch.no_grad():  # Disable gradients for inference
    for batch in tqdm(dataloader, desc="🚀 Extracting features"):
        batch = {k: v.to(device) for k, v in batch.items()}  # Move batch to device
        
        # Forward pass
        outputs = model(**batch)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1).cpu().numpy()

        # Store results
        for p in probs:
            all_results.append({'positive_score': p[2], 'neutral_score': p[1], 'negative_score': p[0]})

        # Save partial results to prevent RAM overload
        if len(all_results) >= save_interval:
            temp_df = pd.DataFrame(all_results)
            temp_df.to_csv(output_file, mode='a', header=not os.path.exists(output_file), index=False)
            all_results = []  # Clear memory

# Final Save
if all_results:
    temp_df = pd.DataFrame(all_results)
    temp_df.to_csv(output_file, mode='a', header=not os.path.exists(output_file), index=False)

print("✅ Feature extraction completed & saved!")
