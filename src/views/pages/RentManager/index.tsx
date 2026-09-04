import {
  Api as ApiIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Email as EmailIcon,
  MonitorHeart as HeartIcon,
  Layers as LayersIcon,
  People as PeopleIcon,
  PlayArrow as PlayIcon,
  Terminal as TerminalIcon,
  Update as UpdateIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Fade,
  Grow,
  Paper,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import React, { useState } from "react";

import useAuth from "../../../hooks/useAuth";

// --- Endpoint Definitions ---
const ENDPOINTS = [
  {
    id: "health",
    label: "Service Integrity",
    sub: "Liveness & Auth Check",
    method: "GET",
    path: "/rentManager/health",
    icon: <HeartIcon fontSize="small" />,
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  {
    id: "tenants-all",
    label: "Tenant Hub",
    sub: "Registry & Directory",
    method: "GET",
    path: "/rentManager/tenants",
    icon: <PeopleIcon fontSize="small" />,
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  },
  {
    id: "tenants-email",
    label: "Email Resolver",
    sub: "Identity Mapping",
    method: "GET",
    path: "/rentManager/tenants/email/:email",
    icon: <EmailIcon fontSize="small" />,
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  },
  {
    id: "tenants-unit-fields",
    label: "Unit Fields Resolver",
    sub: "View Unit UDFs & Details",
    method: "GET",
    path: "/rentManager/tenants/email/:email/unit-fields",
    icon: <EmailIcon fontSize="small" />,
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  },
  {
    id: "tenants-system-fields",
    label: "System Fields Resolver",
    sub: "View Tenant System Fields",
    method: "GET",
    path: "/rentManager/tenants/email/:email/system-fields",
    icon: <EmailIcon fontSize="small" />,
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
  },
  {
    id: "tenants-udf",
    label: "UDF Modifier",
    sub: "Direct Record Update",
    method: "GET",
    path: "/rentManager/tenants/email/:email/udf",
    icon: <UpdateIcon fontSize="small" />,
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  {
    id: "tenants-unit",
    label: "Unit UDF Modifier",
    sub: "Direct Unit Update",
    method: "GET",
    path: "/rentManager/tenants/email/:email/unit",
    icon: <UpdateIcon fontSize="small" />,
    color: "#0284c7",
    gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
  },
  {
    id: "tenants-system",
    label: "System Field Modifier",
    sub: "Direct Tenant System Update",
    method: "GET",
    path: "/rentManager/tenants/email/:email/system",
    icon: <UpdateIcon fontSize="small" />,
    color: "#0d9488",
    gradient: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
  },
  {
    id: "webhook-udf",
    label: "Webhook Engine",
    sub: "Dynamic Logic Trigger",
    method: "POST",
    path: "/rentManager/webhook-udf",
    icon: <LayersIcon fontSize="small" />,
    color: "#f43f5e",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
  },
];

const RentManager = () => {
  const { request } = useAuth();
  const [activeTab, setActiveTab] = useState("health");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [params, setParams] = useState<any>({
    email: "turnovers@premiumpd.com",
    formId: "260627148084444",
    submissionId: "",
    udfName: "Turnover Move In Condition URL",
    udfValue: "Test Value",
    pageSize: 50,
    pageNumber: 1,
    search: "",
  });

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  const executeApi = async () => {
    setLoading(true);
    setResponse(null);
    const start = Date.now();
    try {
      let res;
      if (activeTab === "health") {
        res = await request.get("/rentManager/health");
      } else if (activeTab === "tenants-all") {
        res = await request.get("/rentManager/tenants", {
          params: {
            pageSize: params.pageSize,
            pageNumber: params.pageNumber,
            search: params.search,
          },
        });
      } else if (activeTab === "tenants-email") {
        res = await request.get(`/rentManager/tenants/email/${params.email}`);
      } else if (activeTab === "tenants-unit-fields") {
        res = await request.get(
          `/rentManager/tenants/email/${params.email}/unit-fields`,
          {
            params: { submissionId: params.submissionId },
          }
        );
      } else if (activeTab === "tenants-system-fields") {
        res = await request.get(
          `/rentManager/tenants/email/${params.email}/system-fields`
        );
      } else if (activeTab === "tenants-udf") {
        res = await request.get(
          `/rentManager/tenants/email/${params.email}/udf`,
          {
            params: { name: params.udfName, value: params.udfValue },
          }
        );
      } else if (activeTab === "tenants-unit") {
        res = await request.get(
          `/rentManager/tenants/email/${params.email}/unit`,
          {
            params: {
              name: params.udfName,
              value: params.udfValue,
              submissionId: params.submissionId,
            },
          }
        );
      } else if (activeTab === "tenants-system") {
        res = await request.get(
          `/rentManager/tenants/email/${params.email}/system`,
          {
            params: { name: params.udfName, value: params.udfValue },
          }
        );
      } else if (activeTab === "webhook-udf") {
        res = await request.post("/rentManager/webhook-udf", {
          email: params.email,
          formId: params.formId,
          submissionID: params.submissionId,
        });
      }

      setResponse({
        status: res?.status,
        data: res?.data,
        elapsed: Date.now() - start,
        ok: true,
      });
    } catch (error: any) {
      setResponse({
        status: error.response?.status || 500,
        data: error.response?.data || error.message,
        elapsed: Date.now() - start,
        ok: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const activeEndpoint = ENDPOINTS.find((e) => e.id === activeTab);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 0% 0%, #f1f5f9 0%, #cbd5e1 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(
            activeEndpoint?.color || "#3b82f6",
            0.1
          )} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      {/* Hero Branding */}
      <Box sx={{ mb: 4, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Avatar
            sx={{
              bgcolor: "#1e293b",
              width: 40,
              height: 40,
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
          >
            <TerminalIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography
              variant="h5"
              fontWeight={900}
              sx={{
                color: "#0f172a",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              RM{" "}
              <span
                style={{
                  color: activeEndpoint?.color || "#3b82f6",
                  transition: "color 0.3s",
                }}
              >
                Integration
              </span>
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#64748b",
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "0.65rem",
              }}
            >
              Advanced Orchestration Console
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ position: "relative", zIndex: 1 }}>
        {/* Compact Sidebar */}
        <Grid size={{ xs: 12, lg: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {ENDPOINTS.map((endpoint) => (
              <Paper
                key={endpoint.id}
                elevation={activeTab === endpoint.id ? 4 : 0}
                onClick={() => {
                  setActiveTab(endpoint.id);
                  setResponse(null);
                }}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: "1px solid",
                  borderColor:
                    activeTab === endpoint.id
                      ? endpoint.color
                      : "rgba(226, 232, 240, 0.6)",
                  background:
                    activeTab === endpoint.id
                      ? `linear-gradient(to right, #fff, ${alpha(
                          endpoint.color,
                          0.03
                        )})`
                      : "#fff",
                  transform:
                    activeTab === endpoint.id ? "translateX(6px)" : "none",
                  "&:hover": {
                    borderColor: endpoint.color,
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    transform:
                      activeTab === endpoint.id
                        ? "translateX(6px)"
                        : "translateX(3px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                      activeTab === endpoint.id ? endpoint.gradient : "#f1f5f9",
                    color: activeTab === endpoint.id ? "#fff" : "#94a3b8",
                    transition: "all 0.3s",
                  }}
                >
                  {endpoint.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    sx={{
                      color: activeTab === endpoint.id ? "#0f172a" : "#475569",
                      fontSize: "0.85rem",
                    }}
                  >
                    {endpoint.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  >
                    {endpoint.sub}
                  </Typography>
                </Box>
                {activeTab === endpoint.id && (
                  <ArrowRightIcon
                    sx={{ color: endpoint.color, fontSize: "1.2rem" }}
                  />
                )}
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Compact Console */}
        <Grid size={{ xs: 12, lg: 9 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Command Section */}
            <Grow in timeout={500}>
              <Card
                sx={{
                  borderRadius: 5,
                  border: "none",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    background: "#1e293b",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        mb: 0.2,
                      }}
                    >
                      <Chip
                        label={activeEndpoint?.method}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          height: 18,
                          fontSize: "0.65rem",
                          borderRadius: 1,
                          background: activeEndpoint?.color,
                          color: "#fff",
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight={800}>
                        {activeEndpoint?.label}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#94a3b8",
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        letterSpacing: 0.5,
                      }}
                    >
                      ENDPOINT: {activeEndpoint?.path}
                    </Typography>
                  </Box>
                  <Box sx={{ opacity: 0.2 }}>
                    <ApiIcon fontSize="large" />
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="caption"
                    fontWeight={800}
                    sx={{
                      color: activeEndpoint?.color,
                      display: "block",
                      mb: 2,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Parameters Configuration
                  </Typography>

                  <Grid container spacing={2}>
                    {activeTab === "tenants-all" && (
                      <>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Batch Size"
                            name="pageSize"
                            type="number"
                            variant="filled"
                            value={params.pageSize}
                            onChange={handleParamChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Cursor Index"
                            name="pageNumber"
                            type="number"
                            variant="filled"
                            value={params.pageNumber}
                            onChange={handleParamChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Regex Search"
                            name="search"
                            placeholder="Name pattern..."
                            variant="filled"
                            value={params.search}
                            onChange={handleParamChange}
                          />
                        </Grid>
                      </>
                    )}
                    {(activeTab === "tenants-email" ||
                      activeTab === "tenants-unit-fields" ||
                      activeTab === "tenants-system-fields" ||
                      activeTab === "tenants-udf" ||
                      activeTab === "tenants-unit" ||
                      activeTab === "tenants-system" ||
                      activeTab === "webhook-udf") && (
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Tenant Email Identifier"
                          name="email"
                          variant="filled"
                          value={params.email}
                          onChange={handleParamChange}
                        />
                      </Grid>
                    )}
                    {(activeTab === "tenants-unit-fields" ||
                      activeTab === "tenants-unit") && (
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Submission ID"
                          name="submissionId"
                          placeholder="Submission Ref..."
                          variant="filled"
                          value={params.submissionId}
                          onChange={handleParamChange}
                        />
                      </Grid>
                    )}
                    {(activeTab === "tenants-udf" ||
                      activeTab === "tenants-unit" ||
                      activeTab === "tenants-system") && (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label={
                              activeTab === "tenants-system"
                                ? "System Field Name"
                                : activeTab === "tenants-unit"
                                ? "Unit UDF Name"
                                : "UDF Schema Name"
                            }
                            name="udfName"
                            variant="filled"
                            value={params.udfName}
                            onChange={handleParamChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label={
                              activeTab === "tenants-system"
                                ? "Field Value (or JSON Address)"
                                : "Payload Value"
                            }
                            name="udfValue"
                            variant="filled"
                            value={params.udfValue}
                            onChange={handleParamChange}
                          />
                        </Grid>
                      </>
                    )}
                    {activeTab === "webhook-udf" && (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Origin Form ID"
                            name="formId"
                            variant="filled"
                            value={params.formId}
                            onChange={handleParamChange}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Transaction ID"
                            name="submissionId"
                            placeholder="Submission Ref..."
                            variant="filled"
                            value={params.submissionId}
                            onChange={handleParamChange}
                          />
                        </Grid>
                      </>
                    )}
                    {activeTab === "health" && (
                      <Grid size={{ xs: 12 }}>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: "#f8fafc",
                            borderRadius: 3,
                            border: "2px dashed #e2e8f0",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            align="center"
                            fontWeight={600}
                            sx={{ display: "block" }}
                          >
                            System integrity check will probe the Rent Manager
                            core gateway.
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>

                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      size="medium"
                      onClick={executeApi}
                      disabled={loading}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1,
                        textTransform: "none",
                        fontWeight: 900,
                        fontSize: "0.85rem",
                        boxShadow: `0 8px 16px -4px ${alpha(
                          activeEndpoint?.color || "#3b82f6",
                          0.3
                        )}`,
                        background: activeEndpoint?.gradient,
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: `0 12px 20px -5px ${alpha(
                            activeEndpoint?.color || "#3b82f6",
                            0.4
                          )}`,
                        },
                        transition: "all 0.2s",
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PlayIcon fontSize="small" /> Execute
                        </Box>
                      )}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grow>

            {/* Output Console */}
            {response && (
              <Fade in timeout={800}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                      ml: 1,
                    }}
                  >
                    <TerminalIcon
                      sx={{ color: "#475569", fontSize: "1.1rem" }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color="#1e293b"
                      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                      Terminal Output
                    </Typography>
                  </Box>

                  <Card
                    sx={{
                      borderRadius: 5,
                      overflow: "hidden",
                      boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
                      background: "#0f172a",
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.8 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "#ff5f56",
                          }}
                        />
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "#ffbd2e",
                          }}
                        />
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: "#27c93f",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Chip
                          label={response.status}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: "0.6rem",
                            fontWeight: 900,
                            bgcolor: response.ok
                              ? alpha("#10b981", 0.2)
                              : alpha("#ef4444", 0.2),
                            color: response.ok ? "#10b981" : "#ef4444",
                            borderRadius: 0.5,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#475569",
                            fontWeight: 700,
                            fontSize: "0.65rem",
                          }}
                        >
                          LATENCY: {response.elapsed}MS
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box
                        sx={{
                          maxHeight: 400,
                          overflow: "auto",
                          "&::-webkit-scrollbar": { width: 6 },
                          "&::-webkit-scrollbar-thumb": {
                            bgcolor: "rgba(255,255,255,0.1)",
                            borderRadius: 3,
                          },
                        }}
                      >
                        <pre
                          style={{
                            margin: 0,
                            color: "#38bdf8",
                            fontFamily:
                              "'Fira Code', 'JetBrains Mono', monospace",
                            fontSize: "0.8rem",
                            lineHeight: 1.5,
                          }}
                        >
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Fade>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RentManager;
