import FolderIcon from "@mui/icons-material/Folder";
import InboxIcon from "@mui/icons-material/Inbox";
import PeopleIcon from "@mui/icons-material/People";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useDashboard from "../../../hooks/useDashboard";

const StatCard = ({ title, value, icon, isLoading }: any) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: 3,
      height: "100%",
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={60} height={45} />
          ) : (
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
          )}
        </Box>
        <Box color="primary.main">{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { userData } = useSelector((state: any) => state.user);
  const { dashboardData, isLoadingDashboardData } = useDashboard();

  if (userData?.role === "Key Manager") {
    return <Navigate to="/key-management" replace />;
  }

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        👋 Welcome back
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Forms"
            value={dashboardData?.forms}
            isLoading={isLoadingDashboardData}
            icon={<FolderIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Submissions"
            value={dashboardData?.submissions}
            isLoading={isLoadingDashboardData}
            icon={<PeopleIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard
            title="Files"
            value={dashboardData?.files}
            isLoading={isLoadingDashboardData}
            icon={<InboxIcon fontSize="large" />}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
export default Dashboard;
