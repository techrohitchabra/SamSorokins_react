import { Skeleton, Stack } from "@mui/material";

const TableSkeleton = ({ rows = 7 }: { rows?: number }) => {
  return (
    <Stack spacing={2} p={2} width="100%">
      {[...Array(rows)].map((_, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={48}
          sx={{ borderRadius: 2 }}
        />
      ))}
    </Stack>
  );
};

export default TableSkeleton;
