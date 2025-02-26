import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation } from 'react-router-dom';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean); // Remove empty values

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >

      {/* Generate breadcrumbs dynamically (No Links, Just Text) */}
      {pathSegments.map((segment, index) => {
        const label = segment.charAt(0).toUpperCase() + segment.slice(1); // Capitalize first letter
        const key = `breadcrumb-${index}-${segment}`; // Unique key

        return (
          <Typography key={key} variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {label}
          </Typography>
        );
      })}
    </StyledBreadcrumbs>
  );
}
