import {
  Add,
  Assignment,
  AttachMoney,
  Business,
  CalendarToday,
  Category,
  CheckCircle,
  Delete,
  Edit,
  ExpandMore,
  Link as LinkIcon,
  Person,
  Science,
  TrendingUp,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setLecturerProfileUpdate } from "../../../../redux/slice/LecturerProfileUpdateSlice";
import { colors } from "../../../../theme/colors";
import {
  formatDate,
  getProjectType,
  getScale,
  getStatus,
} from "../../../../utils/ChangeText";
import { API } from "../../../../utils/Fetch";
import AddResearchProjectDialog from "../AddResearchProjectDialog";
import ApproveResearchProjectCreateDialog from "../ApproveResearchProjectCreateDialog";
import ApproveResearchProjectUpdateDialog from "../ApproveResearchProjectUpdateDialog";
import { GeneralConfirmDialog } from "../../../general-dialog";

interface LecturerProfileResearchProjectsTabProps {
  onAddResearchProject?: () => void;
  onEditResearchProject?: (project: any) => void;
  onDeleteResearchProject?: (project: any) => void;
  onApproveResearchProjectUpdate?: (projectData: any) => void;
  onRejectResearchProjectUpdate?: (projectData: any) => void;
  canCreateLecturer?: boolean;
  canApproveLecturer?: boolean;
  canDeleteLecturer?: boolean;
  canUpdateLecturer?: boolean;
}

const LecturerProfileResearchProjectsTab: React.FC<
  LecturerProfileResearchProjectsTabProps
> = (
  {
    // onAddResearchProject,
    // onEditResearchProject,
    // onDeleteResearchProject,
    canCreateLecturer = true,
    canApproveLecturer = true,
    canDeleteLecturer: _canDeleteLecturer = false,
    canUpdateLecturer = false,
  },
) => {
  // Get lecturer data from Redux
  const lecturerProfileUpdate = useSelector(
    (state: any) => state.lecturerProfileUpdate,
  );
  const researchProjects = lecturerProfileUpdate?.researchProjects || [];

  const dispatch = useDispatch();

  // State for ApproveResearchProjectCreateDialog
  const [approveCreateDialog, setApproveCreateDialog] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });

  // State for ApproveResearchProjectUpdateDialog
  const [approveUpdateDialog, setApproveUpdateDialog] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });

  // State for AddResearchProjectDialog
  const [addResearchProjectDialog, setAddResearchProjectDialog] = useState(false);

  // State for Edit ResearchProject Dialog
  const [editProjectDialog, setEditProjectDialog] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });

  // State for Delete Confirmation Dialog
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });

  const formatCurrency = (amount: number) => {
    if (!amount) return "Không xác định";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleOpenApproveCreateDialog = (projectData: any) => {
    // Format data for ApproveResearchProjectCreateDialog
    const formattedData = {
      content: projectData.original,
      lecturerInfo: lecturerProfileUpdate.lecturer || {},
    };
    setApproveCreateDialog({ open: true, data: formattedData });
  };

  const handleCloseApproveCreateDialog = () => {
    setApproveCreateDialog({ open: false, data: null });
  };

  const handleOpenApproveUpdateDialog = (projectData: any) => {
    // Format data for ApproveResearchProjectUpdateDialog
    const formattedData = {
      content: {
        original: projectData.original,
        update: projectData.update,
      },
      lecturerInfo: lecturerProfileUpdate.lecturer || {},
    };
    setApproveUpdateDialog({ open: true, data: formattedData });
  };

  const handleCloseApproveUpdateDialog = async () => {
    setApproveUpdateDialog({ open: false, data: null });
    // Refresh data after dialog closes
    try {
      const response = await API.admin.getLecturerAllProfile({
        id: lecturerProfileUpdate.lecturer.id,
      });
      if (response.data.success) {
        dispatch(setLecturerProfileUpdate(response.data.data));
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleOpenAddResearchProjectDialog = () => {
    setAddResearchProjectDialog(true);
  };

  const handleCloseAddResearchProjectDialog = () => {
    setAddResearchProjectDialog(false);
  };

  const handleSuccessAddResearchProject = async () => {
    // Refresh data after successfully adding research project
    try {
      const response = await API.admin.getLecturerAllProfile({
        id: lecturerProfileUpdate.lecturer.id,
      });
      if (response.data.success) {
        dispatch(setLecturerProfileUpdate(response.data.data));
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Handlers for Edit and Delete
  const handleEditProject = (project: any) => {
    setEditProjectDialog({ open: true, data: project });
  };

  const handleCloseEditProjectDialog = () => {
    setEditProjectDialog({ open: false, data: null });
  };

  const handleSuccessEditProject = async () => {
    // Refresh data after successfully editing project
    try {
      const response = await API.admin.getLecturerAllProfile({
        id: lecturerProfileUpdate.lecturer.id,
      });
      if (response.data.success) {
        dispatch(setLecturerProfileUpdate(response.data.data));
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleDeleteProject = (project: any) => {
    setDeleteConfirmDialog({ open: true, data: project });
  };

  const handleCloseDeleteConfirmDialog = () => {
    setDeleteConfirmDialog({ open: false, data: null });
  };

  const handleConfirmDeleteProject = async () => {
    if (!deleteConfirmDialog.data?.id) {
      toast.error("Không tìm thấy thông tin dự án nghiên cứu cần xóa");
      return;
    }

    try {
      const response = await API.lecturer.deleteResearchProject(deleteConfirmDialog.data.id);
      
      if (response.data.success) {
        toast.success("Xóa dự án nghiên cứu thành công!");
        // Refresh data
        const refreshResponse = await API.admin.getLecturerAllProfile({
          id: lecturerProfileUpdate.lecturer.id,
        });
        if (refreshResponse.data.success) {
          dispatch(setLecturerProfileUpdate(refreshResponse.data.data));
        }
        setDeleteConfirmDialog({ open: false, data: null });
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi xóa dự án nghiên cứu");
      }
    } catch (error: any) {
      console.error("❌ Error deleting research project:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa dự án nghiên cứu!");
    }
  };

  // Function to get banner color based on status
  const getBannerColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)"; // Pastel Green
      case "PENDING":
        return "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"; // Pastel Orange
      case "REJECTED":
        return "linear-gradient(135deg, #FEE2E2 0%, #FCA5A5 100%)"; // Pastel Red
      default:
        return `linear-gradient(135deg, ${colors.primary[100]} 0%, ${colors.secondary[100]} 100%)`; // Default pastel
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <Typography
              variant="h6"
              sx={{
                color: colors.text.primary,
                fontSize: "1.2rem",
              }}
            >
              Dự án nghiên cứu ({researchProjects?.length || 0})
            </Typography>
          </div>
        </div>
        {canCreateLecturer && (
          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: 18 }} />}
            onClick={handleOpenAddResearchProjectDialog}
            size="small"
            sx={{
              background: colors.background.gradient.primary,
              color: "white",
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              py: 0.5,
              minWidth: "auto",
              height: "32px",
              boxShadow: `0 2px 8px ${colors.primary[300]}`,
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: `0 4px 12px ${colors.primary[400]}`,
              },
            }}
          >
            Thêm
          </Button>
        )}
      </div>

      {researchProjects && researchProjects.length > 0 ? (
        <div className="space-y-4">
          {researchProjects.map((projectData: any, index: number) => (
            <Accordion
              key={projectData.original?.id || index}
              className="transition-all duration-300"
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                "&:before": {
                  display: "none",
                },
                "&.Mui-expanded": {
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  transform: "translateY(-2px)",
                },
                mb: 2,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  background: getBannerColor(projectData.original?.status),
                  color: "#111827", // text-black giống LecturerProfileDegreesTab
                  borderRadius: "10px",
                  minHeight: "80px",
                  "& .MuiAccordionSummary-content": {
                    margin: "16px 0",
                  },
                  "& .MuiAccordionSummary-expandIconWrapper": {
                    color: "#111827", // màu đen cho expand icon
                  },
                  "&.Mui-expanded": {
                    borderRadius: "10px 10px 0 0",
                    minHeight: "80px",
                  },
                }}
              >
                <div className="mr-4 flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Science sx={{ color: "#111827", fontSize: 24 }} />
                    </Box>
                    <div className="flex-1">
                      <Typography
                        // variant="h6"
                        sx={{
                          color: "#111827", // màu đen cho title
                          mb: 0.5,
                          fontWeight: 600,
                          width: "100%",
                        }}
                      >
                        {projectData.original?.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#111827", // màu đen cho subtitle
                        }}
                      >
                        Lĩnh vực:{" "}
                        {projectData.original?.researchArea || "Không xác định"}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Chip
                      label={getStatus(projectData.original?.status)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        background: "rgba(255,255,255,0.9)",
                        height: "28px",
                        color:
                          projectData.original?.status === "APPROVED"
                            ? "#047857"
                            : projectData.original?.status === "PENDING"
                              ? "#D97706"
                              : "#DC2626",
                      }}
                    />
                    {projectData.original?.status === "PENDING" ? (
                      canApproveLecturer && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            handleOpenApproveCreateDialog(projectData)
                          }
                          sx={{
                            width: "max-content",
                            fontWeight: 600,
                            background: "rgba(255,255,255,0.9)",
                            color: "#1976d2",
                            textTransform: "none",
                            borderRadius: 2,
                            fontSize: "0.75rem",
                            px: 2,
                            py: 0.5,
                            "&:hover": {
                              background: "rgba(255,255,255,1)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                            },
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      )
                    ) : (
                      projectData.original?.status === "APPROVED" &&
                      projectData.update &&
                      projectData.update.status === "PENDING" &&
                      canApproveLecturer && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            handleOpenApproveUpdateDialog(projectData)
                          }
                          sx={{
                            width: "max-content",
                            fontWeight: 600,
                            background: "rgba(255,255,255,0.9)",
                            color: "#1976d2",
                            textTransform: "none",
                            borderRadius: 2,
                            fontSize: "0.75rem",
                            px: 2,
                            py: 0.5,
                            "&:hover": {
                              background: "rgba(255,255,255,1)",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                            },
                          }}
                        >
                          Xem yêu cầu cập nhật
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </AccordionSummary>

              <AccordionDetails
                sx={{
                  p: 0,
                  background: "white",
                  borderRadius: "0 0 10px 10px",
                }}
              >
                <Box className="p-6">
                  {/* Original Project Information */}
                  <div className="mb-6">
                    {/* Header with Edit/Delete buttons in top-right */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: colors.text.primary,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Category
                          sx={{ fontSize: 18, color: colors.primary[500] }}
                        />
                        Thông tin dự án
                      </Typography>

                      {/* Edit and Delete buttons in top-right corner */}
                      {canUpdateLecturer && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleEditProject(projectData.original)}
                            sx={{
                              minWidth: "auto",
                              width: 32,
                              height: 32,
                              borderRadius: "8px",
                              borderColor: colors.primary[500],
                              color: colors.primary[500],
                              "&:hover": {
                                borderColor: colors.primary[600],
                                backgroundColor: colors.primary[50],
                              },
                            }}
                          >
                            <Edit sx={{ fontSize: 16 }} />
                          </Button>

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleDeleteProject(projectData.original)}
                            sx={{
                              minWidth: "auto",
                              width: 32,
                              height: 32,
                              borderRadius: "8px",
                              borderColor: colors.error[500],
                              color: colors.error[500],
                              "&:hover": {
                                borderColor: colors.error[600],
                                backgroundColor: colors.error[50],
                              },
                            }}
                          >
                            <Delete sx={{ fontSize: 16 }} />
                          </Button>
                        </Box>
                      )}
                    </Box>

                    {/* Chips Section - Compact */}
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                    >
                      {/* Project Type as Chip */}
                      {projectData.original?.projectType && (
                        <Chip
                          icon={
                            <Assignment
                              sx={{ fontSize: 16, color: "white !important" }}
                            />
                          }
                          label={
                            getProjectType
                              ? getProjectType(
                                  projectData.original?.projectType,
                                )
                              : projectData.original?.projectType
                          }
                          size="small"
                          sx={{
                            background:
                              "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
                            color: "white",
                            "& .MuiChip-icon": {
                              color: "white",
                            },
                          }}
                        />
                      )}
                    </Box>

                    {/* Action Buttons - Compact */}
                    <Box sx={{ mb: 2 }}>
                      <div className="flex flex-wrap gap-2">
                        {/* Published URL */}
                        {projectData.original?.publishedUrl && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<LinkIcon />}
                            href={projectData.original?.publishedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              background: colors.background.gradient.primary,
                              color: "white",
                              textTransform: "none",
                              borderRadius: 2,
                              px: 2,
                              py: 0.5,
                              "&:hover": {
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            Xem công bố
                          </Button>
                        )}
                      </div>
                    </Box>

                    {/* Basic Information Grid - Compact */}
                    <Box sx={{ mb: 2 }}>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {/* Quy mô */}
                        {projectData.original?.scale && (
                          <div
                            className="flex items-center gap-3 rounded-lg p-3"
                            style={{
                              background: colors.background.tertiary,
                              border: "1px solid #E5E7EB",
                            }}
                          >
                            <TrendingUp
                              sx={{ color: colors.warning[600] }}
                              fontSize="small"
                            />
                            <div className="flex-1">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.text.tertiary,
                                  display: "block",
                                }}
                              >
                                Quy mô
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: colors.text.secondary }}
                              >
                                {getScale
                                  ? getScale(projectData.original?.scale)
                                  : projectData.original?.scale}
                              </Typography>
                            </div>
                          </div>
                        )}

                        {/* Trạng thái khóa học */}
                        {projectData.original?.courseStatus && (
                          <div
                            className="flex items-center gap-3 rounded-lg p-3"
                            style={{
                              background: colors.background.tertiary,
                              border: "1px solid #E5E7EB",
                            }}
                          >
                            <CheckCircle
                              sx={{ color: colors.success[600] }}
                              fontSize="small"
                            />
                            <div className="flex-1">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.text.tertiary,
                                  display: "block",
                                }}
                              >
                                Trạng thái
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: colors.text.secondary }}
                              >
                                {projectData.original?.courseStatus}
                              </Typography>
                            </div>
                          </div>
                        )}

                        {/* Vai trò trong dự án */}
                        {projectData.original?.roleInProject && (
                          <div
                            className="flex items-center gap-3 rounded-lg p-3"
                            style={{
                              background: colors.background.tertiary,
                              border: "1px solid #E5E7EB",
                            }}
                          >
                            <Person
                              sx={{ color: colors.info[600] }}
                              fontSize="small"
                            />
                            <div className="flex-1">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.text.tertiary,
                                  display: "block",
                                }}
                              >
                                Vai trò
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: colors.text.secondary }}
                              >
                                {projectData.original?.roleInProject}
                              </Typography>
                            </div>
                          </div>
                        )}
                      </div>
                    </Box>

                    {/* Nhóm Thời gian & Nguồn tài trợ - Compact */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: colors.text.primary,
                          mb: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CalendarToday
                          sx={{ fontSize: 18, color: colors.info[600] }}
                        />
                        Thông tin thời gian & tài trợ
                      </Typography>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {/* Thời gian */}
                        <div
                          className="flex items-center gap-3 rounded-lg p-3"
                          style={{
                            background: colors.background.tertiary,
                            border: "1px solid #E5E7EB",
                          }}
                        >
                          <CalendarToday
                            sx={{ color: colors.primary[600] }}
                            fontSize="small"
                          />
                          <div className="flex-1">
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.text.tertiary,
                                display: "block",
                              }}
                            >
                              Thời gian thực hiện
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: colors.text.secondary }}
                            >
                              {formatDate(projectData.original?.startDate)} -{" "}
                              {formatDate(projectData.original?.endDate)}
                            </Typography>
                          </div>
                        </div>

                        {/* Nguồn tài trợ */}
                        <div
                          className="flex items-center gap-3 rounded-lg p-3"
                          style={{
                            background: colors.background.tertiary,
                            border: "1px solid #E5E7EB",
                          }}
                        >
                          <Business
                            sx={{ color: colors.success[600] }}
                            fontSize="small"
                          />
                          <div className="flex-1">
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.text.tertiary,
                                display: "block",
                              }}
                            >
                              Nguồn tài trợ
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: colors.text.secondary }}
                            >
                              {projectData.original?.foundingSource ||
                                "Không xác định"}
                            </Typography>
                          </div>
                        </div>

                        {/* Số tiền tài trợ */}
                        {projectData.original?.foundingAmount && (
                          <div
                            className="flex items-center gap-3 rounded-lg p-3"
                            style={{
                              background: colors.background.tertiary,
                              border: "1px solid #E5E7EB",
                            }}
                          >
                            <AttachMoney
                              sx={{ color: colors.warning[600] }}
                              fontSize="small"
                            />
                            <div className="flex-1">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.text.tertiary,
                                  display: "block",
                                }}
                              >
                                Số tiền tài trợ
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: colors.text.secondary }}
                              >
                                {formatCurrency(
                                  projectData.original?.foundingAmount,
                                )}
                              </Typography>
                            </div>
                          </div>
                        )}
                      </div>
                    </Box>

                    {/* Mô tả - Compact */}
                    {projectData.original?.description && (
                      <Box
                        sx={{
                          mb: 2,
                          p: 3,
                          borderRadius: "8px",
                          background: colors.primary[50],
                          border: `1px solid ${colors.primary[200]}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.text.tertiary,
                            display: "block",
                            mb: 1,
                          }}
                        >
                          Mô tả
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.text.secondary,
                            lineHeight: 1.6,
                          }}
                        >
                          {projectData.original?.description}
                        </Typography>
                      </Box>
                    )}

                    {/* Admin Note - Compact */}
                    {projectData.original?.adminNote && (
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: "8px",
                          background: colors.warning[100],
                          border: `1px solid ${colors.warning[500]}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: colors.warning[700],
                            display: "block",
                            mb: 1,
                          }}
                        >
                          Ghi chú của quản trị viên
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: colors.warning[700] }}
                        >
                          {projectData.original?.adminNote}
                        </Typography>
                      </Box>
                    )}
                  </div>
                  {/* Thông tin thời gian tạo/cập nhật */}
                  <div style={{ marginTop: 24, textAlign: "right" }}>
                    <Typography variant="body2" color="text.secondary">
                      Được tạo lúc:{" "}
                      {projectData.original?.createdAt
                        ? new Date(
                            projectData.original.createdAt,
                          ).toLocaleString("vi-VN")
                        : "Chưa cập nhật"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cập nhật lần cuối:{" "}
                      {projectData.original?.updatedAt
                        ? new Date(
                            projectData.original.updatedAt,
                          ).toLocaleString("vi-VN")
                        : "Chưa cập nhật"}
                    </Typography>
                  </div>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      ) : (
        <Box
          sx={{
            p: 6,
            borderRadius: 4,
            background: colors.primary[50],
            border: `2px dashed ${colors.primary[300]}`,
            textAlign: "center",
          }}
        >
          <Science sx={{ fontSize: 56, color: colors.primary[500], mb: 2 }} />
          <Typography variant="h6" sx={{ color: colors.primary[700], mb: 1 }}>
            Chưa có dự án nghiên cứu nào
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.tertiary }}>
            Thêm thông tin về các dự án nghiên cứu khoa học bạn đã tham gia
          </Typography>
        </Box>
      )}

      {/* ApproveResearchProjectCreateDialog */}
      {approveCreateDialog.open && (
        <ApproveResearchProjectCreateDialog
          open={approveCreateDialog.open}
          data={approveCreateDialog.data}
          onClose={handleCloseApproveCreateDialog}
        />
      )}

      {/* ApproveResearchProjectUpdateDialog */}
      {approveUpdateDialog.open && (
        <ApproveResearchProjectUpdateDialog
          open={approveUpdateDialog.open}
          data={approveUpdateDialog.data}
          onClose={handleCloseApproveUpdateDialog}
        />
      )}

      {/* AddResearchProjectDialog */}
      <AddResearchProjectDialog
        open={addResearchProjectDialog}
        onClose={handleCloseAddResearchProjectDialog}
        lecturer={lecturerProfileUpdate.lecturer}
        onSuccess={handleSuccessAddResearchProject}
      />

      {/* Edit ResearchProject Dialog */}
      {editProjectDialog.open && (
        <AddResearchProjectDialog
          open={editProjectDialog.open}
          onClose={handleCloseEditProjectDialog}
          lecturer={lecturerProfileUpdate.lecturer}
          onSuccess={handleSuccessEditProject}
          editMode={true}
          projectData={editProjectDialog.data}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmDialog.open && (
        <GeneralConfirmDialog
          open={deleteConfirmDialog.open}
          onClose={handleCloseDeleteConfirmDialog}
          onConfirm={handleConfirmDeleteProject}
          title="Xác nhận xóa dự án nghiên cứu"
          message={`Bạn có chắc chắn muốn xóa dự án nghiên cứu "${deleteConfirmDialog.data?.title || 'này'}" không? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          confirmColor="error"
        />
      )}
    </div>
  );
};

export default LecturerProfileResearchProjectsTab;
