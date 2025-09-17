import {
  Add,
  CalendarToday,
  Category,
  Delete,
  Edit,
  ExpandMore,
  Group,
  LocationOn,
  Person,
  School,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { colors } from "../../../../theme/colors";
import {
  formatDateToVietnamTime,
  getCourseType,
  getScale,
  getStatus,
} from "../../../../utils/ChangeText";
import { API } from "../../../../utils/Fetch";
import { setLecturerProfileUpdate } from "../../../../redux/slice/LecturerProfileUpdateSlice";
import { useDispatch } from "react-redux";
import AddAttendedCourseDialog from "../AddAttendedCourseDialog";
import AddOwnedCourseDialog from "../AddOwnedCourseDialog";
import ApproveAttendedCourseCreateDialog from "../ApproveAttendedCourseCreateDialog";
import ApproveAttendedCourseUpdateDialog from "../ApproveAttendedCourseUpdateDialog";
import ApproveOwnedCourseCreateDialog from "../ApproveOwnedCourseCreateDialog";
import ApproveOwnedCourseUpdateDialog from "../ApproveOwnedCourseUpdateDialog";
import { GeneralConfirmDialog } from "../../../general-dialog";

interface LecturerProfileCoursesTabProps {
  onAddOwnedCourse?: () => void;
  onAddAttendedCourse?: () => void;
  onEditOwnedCourse?: (course: any) => void;
  onEditAttendedCourse?: (course: any) => void;
  onDeleteOwnedCourse?: (course: any) => void;
  onDeleteAttendedCourse?: (course: any) => void;
  canCreateLecturer?: boolean;
  canApproveLecturer?: boolean;
  canDeleteLecturer?: boolean;
  canUpdateLecturer?: boolean;
}

const LecturerProfileCoursesTab: React.FC<LecturerProfileCoursesTabProps> = ({
  // onAddOwnedCourse,
  // onAddAttendedCourse,
  // onEditOwnedCourse,
  // onEditAttendedCourse,
  // onDeleteOwnedCourse,
  // onDeleteAttendedCourse,
  canCreateLecturer = true,
  canApproveLecturer = true,
  canDeleteLecturer: _canDeleteLecturer = false,
  canUpdateLecturer = false,
}) => {
  // Get lecturer data from Redux
  const lecturerProfileUpdate = useSelector(
    (state: any) => state.lecturerProfileUpdate,
  );
  const ownedCourses = lecturerProfileUpdate?.ownedCourses || [];
  const attendedCourses = lecturerProfileUpdate?.attendedCourses || [];

  const dispatch = useDispatch();

  // State for Add dialogs
  const [addOwnedCourseDialog, setAddOwnedCourseDialog] = useState(false);
  const [addAttendedCourseDialog, setAddAttendedCourseDialog] = useState(false);

  // State for ApproveOwnedCourseCreateDialog
  const [approveOwnedCreateDialog, setApproveOwnedCreateDialog] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });

  // State for ApproveAttendedCourseCreateDialog
  const [approveAttendedCreateDialog, setApproveAttendedCreateDialog] =
    useState<{
      open: boolean;
      data: any;
    }>({ open: false, data: null });

  // State for ApproveOwnedCourseUpdateDialog
  const [approveOwnedUpdateDialog, setApproveOwnedUpdateDialog] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });

  // State for ApproveAttendedCourseUpdateDialog
  const [approveAttendedUpdateDialog, setApproveAttendedUpdateDialog] =
    useState<{
      open: boolean;
      data: any;
    }>({ open: false, data: null });

  // State for Edit dialogs
  const [editOwnedCourseDialog, setEditOwnedCourseDialog] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });

  const [editAttendedCourseDialog, setEditAttendedCourseDialog] = useState<{
    open: boolean;
    data: any;
  }>({ open: false, data: null });

  // State for Delete Confirmation Dialog
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean;
    data: any;
    type: "owned" | "attended";
  }>({ open: false, data: null, type: "owned" });

  // Utility functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa xác định";
    return new Date(dateString).toLocaleDateString("vi-VN");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "#047857";
      case "PENDING":
        return "#D97706";
      case "REJECTED":
        return "#DC2626";
      default:
        return "#6B7280";
    }
  };

  const handleOpenApproveOwnedCreateDialog = (courseData: any) => {
    const formattedData = {
      content: courseData.original,
      lecturerInfo: lecturerProfileUpdate.lecturer || {},
    };
    setApproveOwnedCreateDialog({ open: true, data: formattedData });
  };

  const handleCloseApproveOwnedCreateDialog = () => {
    setApproveOwnedCreateDialog({ open: false, data: null });
  };

  const handleOpenApproveAttendedCreateDialog = (courseData: any) => {
    const formattedData = {
      content: courseData.original,
      lecturerInfo: lecturerProfileUpdate.lecturer || {},
    };
    setApproveAttendedCreateDialog({ open: true, data: formattedData });
  };

  const handleCloseApproveAttendedCreateDialog = () => {
    setApproveAttendedCreateDialog({ open: false, data: null });
  };

  const handleOpenApproveOwnedUpdateDialog = (courseData: any) => {
    const formattedData = {
      content: courseData,
      lecturerInfo: lecturerProfileUpdate.lecturer || {},
    };
    setApproveOwnedUpdateDialog({ open: true, data: formattedData });
  };

  const handleCloseApproveOwnedUpdateDialog = () => {
    setApproveOwnedUpdateDialog({ open: false, data: null });
  };

  const handleOpenApproveAttendedUpdateDialog = (courseData: any) => {
    const formattedData = {
      content: courseData,
      lecturerInfo: lecturerProfileUpdate.lecturer || {},
    };
    setApproveAttendedUpdateDialog({ open: true, data: formattedData });
  };

  const handleCloseApproveAttendedUpdateDialog = () => {
    setApproveAttendedUpdateDialog({ open: false, data: null });
  };

  // Add course handlers
  const handleSuccessAddOwnedCourse = async () => {
    setAddOwnedCourseDialog(false);
    // Refresh lecturer data after adding owned course
    const response = await API.admin.getLecturerAllProfile({
      id: lecturerProfileUpdate.lecturer.id,
    });
    if (response.data.success) {
      dispatch(setLecturerProfileUpdate(response.data.data));
    }
  };

  const handleSuccessAddAttendedCourse = async () => {
    setAddAttendedCourseDialog(false);
    // Refresh lecturer data after adding attended course
    const response = await API.admin.getLecturerAllProfile({
      id: lecturerProfileUpdate.lecturer.id,
    });
    if (response.data.success) {
      dispatch(setLecturerProfileUpdate(response.data.data));
    }
  };

  // Edit course handlers
  const handleEditOwnedCourse = (course: any) => {
    setEditOwnedCourseDialog({ open: true, data: course });
  };

  const handleCloseEditOwnedCourseDialog = () => {
    setEditOwnedCourseDialog({ open: false, data: null });
  };

  const handleSuccessEditOwnedCourse = async () => {
    // Refresh data after successfully editing owned course
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

  const handleEditAttendedCourse = (course: any) => {
    setEditAttendedCourseDialog({ open: true, data: course });
  };

  const handleCloseEditAttendedCourseDialog = () => {
    setEditAttendedCourseDialog({ open: false, data: null });
  };

  const handleSuccessEditAttendedCourse = async () => {
    // Refresh data after successfully editing attended course
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

  // Delete course handlers
  const handleDeleteOwnedCourse = (course: any) => {
    setDeleteConfirmDialog({ open: true, data: course, type: "owned" });
  };

  const handleDeleteAttendedCourse = (course: any) => {
    setDeleteConfirmDialog({ open: true, data: course, type: "attended" });
  };

  const handleCloseDeleteConfirmDialog = () => {
    setDeleteConfirmDialog({ open: false, data: null, type: "owned" });
  };

  const handleConfirmDeleteCourse = async () => {
    if (!deleteConfirmDialog.data?.id) {
      toast.error("Không tìm thấy thông tin khóa học cần xóa");
      return;
    }

    try {
      let response;
      
      if (deleteConfirmDialog.type === "owned") {
        response = await API.lecturer.deleteOwnedCourse(deleteConfirmDialog.data.id);
      } else {
        response = await API.lecturer.deleteAttendedCourse(deleteConfirmDialog.data.id);
      }
      
      if (response.data.success) {
        toast.success(`Xóa khóa học ${deleteConfirmDialog.type === "owned" ? "sở hữu" : "đã tham gia"} thành công!`);
        // Refresh data
        const refreshResponse = await API.admin.getLecturerAllProfile({
          id: lecturerProfileUpdate.lecturer.id,
        });
        if (refreshResponse.data.success) {
          dispatch(setLecturerProfileUpdate(refreshResponse.data.data));
        }
        setDeleteConfirmDialog({ open: false, data: null, type: "owned" });
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi xóa khóa học");
      }
    } catch (error: any) {
      console.error("❌ Error deleting course:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa khóa học!");
    }
  };

  const renderCourseCard = (item: any, isOwned: boolean = false) => {
    // Always display original data
    const currentData = item.original;
    const hasUpdate = item.update && item.update.status === "PENDING";

    return (
      <Accordion
        key={currentData.id}
        className="transition-all duration-300"
        sx={{
          borderRadius: "12px",
          overflow: "hidden", // quan trọng để bo góc đều
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          "&.Mui-expanded": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            transform: "translateY(-2px)",
          },
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            background: getBannerColor(item.original?.status || item.status),
            color: "#111827",
            "& .MuiAccordionSummary-expandIconWrapper": {
              color: "#111827",
            },
          }}
        >
          <div className="mr-4 flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <Box
                className="rounded-lg p-2"
                sx={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {isOwned ? (
                  <School sx={{ color: "#111827" }} />
                ) : (
                  <Group sx={{ color: "#111827" }} />
                )}
              </Box>
              <div>
                <Typography
                  variant="h6"
                  className="font-bold"
                  sx={{ color: "#111827" }}
                >
                  {currentData.title || "Không có tiêu đề"}
                </Typography>
                <Typography variant="body2" sx={{ color: "#111827" }}>
                  {isOwned
                    ? currentData.topic
                    : currentData.organizer || "Không có thông tin tổ chức"}
                </Typography>
                {currentData.referenceId && (
                  <Typography variant="caption" sx={{ color: "#374151" }}>
                    Reference ID: {currentData.referenceId}
                  </Typography>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Chip
                label={getStatus(currentData.status)}
                size="small"
                sx={{
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.9)",
                  color: getStatusColor(currentData.status),
                }}
              />
              {currentData.status === "PENDING" ? (
                canApproveLecturer && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      isOwned
                        ? handleOpenApproveOwnedCreateDialog(item)
                        : handleOpenApproveAttendedCreateDialog(item)
                    }
                    sx={{
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
                currentData.status === "APPROVED" &&
                hasUpdate &&
                canApproveLecturer && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      if (isOwned) {
                        handleOpenApproveOwnedUpdateDialog(item);
                      } else {
                        handleOpenApproveAttendedUpdateDialog(item);
                      }
                    }}
                    sx={{
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
            borderRadius: "0 0 12px 12px",
          }}
        >
          <Box className="p-6">
            {/* Edit and Delete buttons */}
            {canUpdateLecturer && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  mb: 3,
                  pb: 2,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (isOwned) {
                      handleEditOwnedCourse(currentData);
                    } else {
                      handleEditAttendedCourse(currentData);
                    }
                  }}
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
                  onClick={() => {
                    if (isOwned) {
                      handleDeleteOwnedCourse(currentData);
                    } else {
                      handleDeleteAttendedCourse(currentData);
                    }
                  }}
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

            {/* Course Information */}
            <div className="mb-6">
              {/* Thumbnail and Description Row (only for owned courses) */}
              {isOwned && currentData.thumbnailUrl && (
                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Thumbnail */}
                  <Box>
                    <img
                      src={currentData.thumbnailUrl}
                      alt={currentData.title}
                      style={{
                        width: "100%",
                        maxWidth: "300px",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                      }}
                    />
                  </Box>

                  {/* Description */}
                  {currentData.description && (
                    <Box
                      className="rounded-lg p-4"
                      sx={{ background: `${colors.primary[25]}` }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Mô tả
                      </Typography>
                      <Typography
                        variant="body2"
                        className="mt-1"
                        sx={{
                          color: colors.text.secondary,
                          lineHeight: 1.6,
                        }}
                      >
                        {currentData.description}
                      </Typography>
                    </Box>
                  )}
                </div>
              )}

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Basic Info Items */}
                {currentData.topic && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <Category className="text-blue-600" fontSize="small" />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Chủ đề
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {currentData.topic}
                      </Typography>
                    </div>
                  </div>
                )}

                {!isOwned && currentData.organizer && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <Person className="text-green-600" fontSize="small" />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Tổ chức
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {currentData.organizer}
                      </Typography>
                    </div>
                  </div>
                )}

                {currentData.courseType && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <School className="text-purple-600" fontSize="small" />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Loại khóa học
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {getCourseType(currentData.courseType)}
                      </Typography>
                    </div>
                  </div>
                )}

                {currentData.scale && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <School className="text-indigo-600" fontSize="small" />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Quy mô
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {getScale(currentData.scale)}
                      </Typography>
                    </div>
                  </div>
                )}

                {(currentData.startDate || currentData.endDate) && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <CalendarToday
                      className="text-green-600"
                      fontSize="small"
                    />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Thời gian
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {formatDate(currentData.startDate)} -{" "}
                        {formatDate(currentData.endDate)}
                      </Typography>
                    </div>
                  </div>
                )}

                {(currentData.location || currentData.address) && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <LocationOn className="text-red-600" fontSize="small" />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Địa điểm
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {currentData.location || currentData.address}
                      </Typography>
                    </div>
                  </div>
                )}

                {currentData.level && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <School className="text-orange-600" fontSize="small" />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Cấp độ
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {currentData.level}
                      </Typography>
                    </div>
                  </div>
                )}

                {currentData.language && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <School className="text-teal-600" fontSize="small" />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Ngôn ngữ
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {currentData.language === "Vietnamese"
                          ? "Tiếng Việt"
                          : currentData.language}
                      </Typography>
                    </div>
                  </div>
                )}

                {currentData.numberOfHour && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <CalendarToday className="text-blue-600" fontSize="small" />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Số giờ
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {currentData.numberOfHour} giờ
                      </Typography>
                    </div>
                  </div>
                )}

                {currentData.price && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <School className="text-green-600" fontSize="small" />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Giá
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {currentData.price.toLocaleString("vi-VN")} VNĐ
                      </Typography>
                    </div>
                  </div>
                )}

                {currentData.isOnline !== undefined && (
                  <div
                    className="flex items-center gap-3 rounded-lg p-3"
                    style={{
                      background: colors.background.tertiary,
                    }}
                  >
                    <LocationOn className="text-purple-600" fontSize="small" />
                    <div>
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.text.tertiary,
                          fontWeight: 600,
                        }}
                      >
                        Hình thức
                      </Typography>
                      <Typography variant="body2" className="font-medium">
                        {currentData.isOnline ? "Trực tuyến" : "Trực tiếp"}
                      </Typography>
                    </div>
                  </div>
                )}
              </div>

              {/* Description for attended courses (when no thumbnail) */}
              {!isOwned && currentData.description && (
                <Box
                  className="mb-4 rounded-lg p-4"
                  sx={{ background: `${colors.primary[25]}` }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.text.tertiary,
                      fontWeight: 600,
                    }}
                  >
                    Mô tả
                  </Typography>
                  <Typography
                    variant="body2"
                    className="mt-1"
                    sx={{
                      color: colors.text.secondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {currentData.description}
                  </Typography>
                </Box>
              )}

              {/* Description for owned courses without thumbnail */}
              {isOwned &&
                !currentData.thumbnailUrl &&
                currentData.description && (
                  <Box
                    className="mb-4 rounded-lg p-4"
                    sx={{ background: `${colors.primary[25]}` }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.text.tertiary,
                        fontWeight: 600,
                      }}
                    >
                      Mô tả
                    </Typography>
                    <Typography
                      variant="body2"
                      className="mt-1"
                      sx={{
                        color: colors.text.secondary,
                        lineHeight: 1.6,
                      }}
                    >
                      {currentData.description}
                    </Typography>
                  </Box>
                )}

              {/* Requirements (only for owned courses) */}
              {isOwned && currentData.requirements && (
                <Box
                  className="mb-4 rounded-lg p-4"
                  sx={{ background: `${colors.primary[25]}` }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.text.tertiary,
                      fontWeight: 600,
                    }}
                  >
                    Yêu cầu tham gia
                  </Typography>
                  <Typography
                    variant="body2"
                    className="mt-1"
                    sx={{
                      color: colors.text.secondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {currentData.requirements}
                  </Typography>
                </Box>
              )}

              {/* Admin Note */}
              {currentData.adminNote && (
                <Box
                  className="mb-4 rounded-lg p-3"
                  sx={{
                    background: "#FEF3C7",
                    border: "1px solid #F59E0B",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#92400E",
                      fontWeight: 600,
                    }}
                  >
                    Ghi chú của quản trị viên
                  </Typography>
                  <Typography
                    variant="body2"
                    className="mt-1"
                    sx={{ color: "#92400E" }}
                  >
                    {currentData.adminNote}
                  </Typography>
                </Box>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {(currentData.courseUrl || currentData.contentUrl) && (
                  <>
                    {currentData.courseUrl && (
                      <Button
                        variant="contained"
                        size="small"
                        href={currentData.courseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
                          color: "white",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,
                          "&:hover": {
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        Link khóa học
                      </Button>
                    )}
                    {currentData.contentUrl && (
                      <Button
                        variant="contained"
                        size="small"
                        href={currentData.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
                          color: "white",
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,
                          "&:hover": {
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        Nội dung khóa học
                      </Button>
                    )}
                    
                  </>
                )}

                {/* <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => {
                    if (isOwned && onEditOwnedCourse) {
                      onEditOwnedCourse(item);
                    } else if (!isOwned && onEditAttendedCourse) {
                      onEditAttendedCourse(item);
                    }
                  }}
                  sx={{
                    borderColor: colors.primary[500],
                    color: colors.primary[500],
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: colors.primary[600],
                      backgroundColor: colors.primary[50],
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Chỉnh sửa
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Delete />}
                  onClick={() =>
                    handleDelete(item, isOwned ? "owned" : "attended")
                  }
                  sx={{
                    borderColor: "#EF4444",
                    color: "#EF4444",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: "#DC2626",
                      backgroundColor: "#FEF2F2",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Xóa
                </Button> */}
              </div>
            </div>
            {/* Thông tin thời gian tạo/cập nhật */}
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <Typography variant="body2" color="text.secondary">
                Được tạo lúc: {formatDateToVietnamTime(item.original?.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cập nhật lần cuối: {formatDateToVietnamTime(item.original?.updatedAt)}
              </Typography>
            </div>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <div className="space-y-4">
      {/* Owned Training Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Typography
            variant="h6"
            sx={{ color: colors.text.primary, fontWeight: 600 }}
          >
            Khóa học sở hữu ({ownedCourses?.length || 0})
          </Typography>

          {canCreateLecturer && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddOwnedCourseDialog(true)}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
            >
              Thêm
            </Button>
          )}
        </div>

        {ownedCourses && ownedCourses.length > 0 ? (
          ownedCourses.map((courseData: any, index: number) => (
            <div key={courseData.original?.id || index}>
              {renderCourseCard(courseData, true)}
            </div>
          ))
        ) : (
          <Alert severity="info" className="text-center">
            Chưa có thông tin khóa học sở hữu
          </Alert>
        )}
      </div>

      {/* Attended Training Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Typography
            variant="h6"
            sx={{ color: colors.text.primary, fontWeight: 600 }}
          >
            Khóa học đã tham gia ({attendedCourses?.length || 0})
          </Typography>

          {canCreateLecturer && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddAttendedCourseDialog(true)}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
                color: "white",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: 2,
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
            >
              Thêm
            </Button>
          )}
        </div>

        {attendedCourses && attendedCourses.length > 0 ? (
          attendedCourses.map((courseData: any, index: number) => (
            <div key={courseData.original?.id || index}>
              {renderCourseCard(courseData, false)}
            </div>
          ))
        ) : (
          <Alert severity="info" className="text-center">
            Chưa có thông tin khóa học đã tham gia
          </Alert>
        )}
      </div>

      {/* ApproveOwnedCourseCreateDialog */}
      {approveOwnedCreateDialog.open && (
        <ApproveOwnedCourseCreateDialog
          open={approveOwnedCreateDialog.open}
          data={approveOwnedCreateDialog.data}
          onClose={handleCloseApproveOwnedCreateDialog}
        />
      )}

      {/* ApproveAttendedCourseCreateDialog */}
      {approveAttendedCreateDialog.open && (
        <ApproveAttendedCourseCreateDialog
          open={approveAttendedCreateDialog.open}
          data={approveAttendedCreateDialog.data}
          onClose={handleCloseApproveAttendedCreateDialog}
        />
      )}

      {/* ApproveOwnedCourseUpdateDialog */}
      {approveOwnedUpdateDialog.open && (
        <ApproveOwnedCourseUpdateDialog
          open={approveOwnedUpdateDialog.open}
          data={approveOwnedUpdateDialog.data}
          onClose={handleCloseApproveOwnedUpdateDialog}
        />
      )}

      {/* ApproveAttendedCourseUpdateDialog */}
      {approveAttendedUpdateDialog.open && (
        <ApproveAttendedCourseUpdateDialog
          open={approveAttendedUpdateDialog.open}
          data={approveAttendedUpdateDialog.data}
          onClose={handleCloseApproveAttendedUpdateDialog}
        />
      )}

      {/* AddOwnedCourseDialog */}
      {addOwnedCourseDialog && (
        <AddOwnedCourseDialog
          open={addOwnedCourseDialog}
          onClose={() => setAddOwnedCourseDialog(false)}
          lecturer={lecturerProfileUpdate.lecturer}
          onSuccess={handleSuccessAddOwnedCourse}
        />
      )}

      {/* AddAttendedCourseDialog */}
      {addAttendedCourseDialog && (
        <AddAttendedCourseDialog
          open={addAttendedCourseDialog}
          onClose={() => setAddAttendedCourseDialog(false)}
          lecturer={lecturerProfileUpdate.lecturer}
          onSuccess={handleSuccessAddAttendedCourse}
        />
      )}

      {/* Edit Owned Course Dialog */}
      {editOwnedCourseDialog.open && (
        <AddOwnedCourseDialog
          open={editOwnedCourseDialog.open}
          onClose={handleCloseEditOwnedCourseDialog}
          lecturer={lecturerProfileUpdate.lecturer}
          onSuccess={handleSuccessEditOwnedCourse}
          editMode={true}
          courseData={editOwnedCourseDialog.data}
        />
      )}

      {/* Edit Attended Course Dialog */}
      {editAttendedCourseDialog.open && (
        <AddAttendedCourseDialog
          open={editAttendedCourseDialog.open}
          onClose={handleCloseEditAttendedCourseDialog}
          lecturer={lecturerProfileUpdate.lecturer}
          onSuccess={handleSuccessEditAttendedCourse}
          editMode={true}
          courseData={editAttendedCourseDialog.data}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmDialog.open && (
        <GeneralConfirmDialog
          open={deleteConfirmDialog.open}
          onClose={handleCloseDeleteConfirmDialog}
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa khóa học ${deleteConfirmDialog.type === "owned" ? "sở hữu" : "đã tham gia"} này không? Hành động này không thể hoàn tác.`}
          onConfirm={handleConfirmDeleteCourse}
          confirmText="Xác nhận xóa"
          cancelText="Hủy"
          confirmColor="error"
        />
      )}
    </div>
  );
};

export default LecturerProfileCoursesTab;
