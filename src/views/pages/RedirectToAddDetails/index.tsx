import { useEffect } from "react";
import TableSkeleton from "../../components/skeleton/TableSkeleton";
import { useParams, useNavigate } from "react-router-dom";
import useUniqueId from "../../../hooks/useUniqueId";
import { Box, Typography, Button } from "@mui/material";

const RedirectToAddDetails = () => {
  const { id } = useParams(); //param id is the uniqueId
  const navigate = useNavigate();
  const { submissionDataByUniqueId, isLoading, error } = useUniqueId(id);

  useEffect(() => {
    if (
      submissionDataByUniqueId?.data?.submissionId &&
      submissionDataByUniqueId?.data?.formId
    ) {
      navigate(
        `/jotform/form/${submissionDataByUniqueId.data.formId}?submissionId=${submissionDataByUniqueId.data.submissionId}`
      );
    }
  }, [submissionDataByUniqueId, navigate]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error || !submissionDataByUniqueId?.data?.submissionId) {
    return (
      <Box sx={{ p: 4, mt: 8, textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          Unable to find Submission ID
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          {error?.message ||
            "The submission for this record could not be found or has not been processed yet."}
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          Go back to Home
        </Button>
      </Box>
    );
  }

  return <TableSkeleton />;
};
export default RedirectToAddDetails;
