import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Chip,
  Stack,
  Card,
  CardContent,
  IconButton,
  Avatar,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

import { toast } from "react-toastify";
import { getAcademicRankLabel, getVietnameseScale } from "../utils/ChangeText";
import { getCourseType } from "../utils/CourseChangeText";
import { API } from "../utils/Fetch";
import { setLecturerRequests } from "../redux/slice/LecturerRquestSlice";
import { useDispatch } from "react-redux";

interface OwnedCourseCreateDialogProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

const OwnedCourseCreateDialog: React.FC<OwnedCourseCreateDialogProps> = ({
  open,
  onClose,
  data,
}) => {
  const dispatch = useDispatch();
  const [adminNote, setAdminNote] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState<
    "approve" | "reject" | null
  >(null);
  const [loading, setLoading] = useState(false);

  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.admin.approveOwnedCourse({ id: data.content.id });
      if (!res.data.success) {
        toast.error("Duyệt khóa học không thành công!");
        return;
      }
      toast.success("Khóa học đã được duyệt thành công!");
      const responseData = await API.admin.getLecturerRequests();
      dispatch(setLecturerRequests(responseData.data.data));
      setShowConfirmDialog(null);
      setAdminNote("");
      onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi duyệt khóa học!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [onClose]);

  const handleReject = useCallback(async () => {
    if (!adminNote.trim()) {
      toast.error("Vui lòng nhập ghi chú từ chối!");
      return;
    }

    setLoading(true);
    try {
      const res = await API.admin.rejectOwnedCourse({
        id: data.content.id,
        adminNote,
      });
      if (!res.data.success) {
        toast.error("Từ chối khóa học không thành công!");
        return;
      }
      const responseData = await API.admin.getLecturerRequests();
      dispatch(setLecturerRequests(responseData.data.data));

      toast.success("Khóa học đã bị từ chối thành công!");
      setShowConfirmDialog(null);
      setAdminNote(""); // Reset admin note
      onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối khóa học!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [adminNote, onClose]);

  const handleCloseConfirmDialog = useCallback(() => {
    setShowConfirmDialog(null);
    setAdminNote(""); // Reset admin note when closing dialog
  }, []);

  if (!data) {
    return null;
  }

  const { content, lecturerInfo } = data;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
            pt: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                width: 48,
                height: 48,
              }}
            >
              <SchoolIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Chi tiết khóa học
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Yêu cầu tạo mới khóa học
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                ID: {content.id}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="large" sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 4, py: 4, backgroundColor: "#f8fafc" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {/* Left Column */}
            <Stack spacing={3}>
              {/* Course Image */}
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <img
                    src={content.thumbnailUrl}
                    alt="Course Thumbnail"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      backgroundColor: "rgba(0,0,0,0.7)",
                      borderRadius: 2,
                      px: 2,
                      py: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "white", fontWeight: 600 }}
                    >
                      {content.isOnline ? "ONLINE" : "OFFLINE"}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mb: 1, color: "#1e293b" }}
                  >
                    {content.title}
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                  >
                    <Chip
                      label={content.level}
                      size="small"
                      sx={{
                        backgroundColor: "#e0f2fe",
                        color: "#0277bd",
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={getCourseType(content.courseType)}
                      size="small"
                      sx={{
                        backgroundColor: "#f3e5f5",
                        color: "#7b1fa2",
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      label={
                        getVietnameseScale(content.scale) || "Chưa xác định"
                      }
                      size="small"
                      sx={{
                        backgroundColor: "#e8f5e8",
                        color: "#2e7d32",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {content.description || "Không có mô tả"}
                  </Typography>
                </CardContent>
              </Card>

              {/* Lecturer Info */}
              <Card
                sx={{
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.1)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 2, color: "#4f46e5" }}
                  >
                    Thông tin giảng viên
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Avatar
                      src={lecturerInfo?.avatarUrl || ""}
                      sx={{
                        width: 80,
                        height: 80,
                        border: "3px solid white",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    >
                      {lecturerInfo?.fullName?.charAt(0) || ""}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, color: "#1e293b" }}
                        >
                          {lecturerInfo?.fullName}
                        </Typography>
                        <Chip
                          size="small"
                          label={getAcademicRankLabel(
                            lecturerInfo?.academicRank,
                          )}
                          sx={{
                            backgroundColor: "#4f46e5",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", mb: 0.5 }}
                      >
                        📧 {lecturerInfo?.email}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        🎓 {lecturerInfo?.experienceYears} năm kinh nghiệm •{" "}
                        {lecturerInfo?.specialization}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Stack>

            {/* Right Column */}
            <Stack spacing={3}>
              {/* Course Details */}
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 3, color: "#1e293b" }}
                  >
                    📋 Thông tin chi tiết
                  </Typography>
                  <Stack spacing={2.5}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontWeight: 600 }}
                      >
                        Chủ đề:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#1e293b" }}
                      >
                        {content.topic}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontWeight: 600 }}
                      >
                        Ngôn ngữ:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#1e293b" }}
                      >
                        {content.language}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontWeight: 600 }}
                      >
                        Yêu cầu:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "#1e293b" }}
                      >
                        {content.requirements}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontWeight: 600 }}
                      >
                        Địa chỉ:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#1e293b",
                          maxWidth: "60%",
                          textAlign: "right",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {content.address}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        backgroundColor: "#f1f5f9",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontWeight: 600 }}
                      >
                        💰 Giá khóa học:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#dc2626" }}
                      >
                        {content.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Time & Schedule */}
              <Card
                sx={{
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)",
                  boxShadow: "0 8px 32px rgba(252, 211, 77, 0.3)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 2, color: "#92400e" }}
                  >
                    📅 Thời gian khóa học
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        sx={{ color: "#92400e", fontWeight: 600 }}
                      >
                        Bắt đầu
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#92400e" }}
                      >
                        {content.startDate
                          ? new Date(content.startDate).toLocaleDateString(
                              "vi-VN",
                              { timeZone: "UTC" },
                            )
                          : "Không xác định"}
                      </Typography>
                    </Box>
                    <Box sx={{ color: "#92400e", fontSize: "1.5rem" }}>→</Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        sx={{ color: "#92400e", fontWeight: 600 }}
                      >
                        Kết thúc
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#92400e" }}
                      >
                        {content.endDate
                          ? new Date(content.endDate).toLocaleDateString(
                              "vi-VN",
                              { timeZone: "UTC" },
                            )
                          : "Không xác định"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Links */}
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 2, color: "#1e293b" }}
                  >
                    🔗 Liên kết
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    href={content.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                    sx={{
                      py: 1.5,
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(102, 126, 234, 0.5)",
                      },
                    }}
                  >
                    Xem nội dung khóa học
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 4,
            py: 3,
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            gap: 2,
          }}
        >
          <Button
            onClick={() => setShowConfirmDialog("reject")}
            variant="contained"
            sx={{
              minWidth: 120,
              py: 1.5,
              backgroundColor: "#dc2626",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(220, 38, 38, 0.3)",
              "&:hover": {
                backgroundColor: "#b91c1c",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(220, 38, 38, 0.4)",
              },
            }}
          >
            Từ chối
          </Button>
          <Button
            onClick={() => setShowConfirmDialog("approve")}
            variant="contained"
            sx={{
              minWidth: 120,
              py: 1.5,
              backgroundColor: "#059669",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(5, 150, 105, 0.3)",
              "&:hover": {
                backgroundColor: "#047857",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(5, 150, 105, 0.4)",
              },
            }}
          >
            Phê duyệt
          </Button>
        </DialogActions>
      </Dialog>

      {showConfirmDialog && (
        <Dialog
          open={true}
          onClose={handleCloseConfirmDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showConfirmDialog === "approve" ? (
              <>
                <CheckCircleIcon color="success" />
                <Typography variant="h6">Xác nhận duyệt khóa học</Typography>
              </>
            ) : (
              <>
                <CancelIcon color="error" />
                <Typography variant="h6">Xác nhận từ chối khóa học</Typography>
              </>
            )}
          </DialogTitle>
          <DialogContent>
            {showConfirmDialog === "approve" ? (
              <Alert severity="info">
                Bạn có chắc chắn muốn duyệt khóa học "{content.title}" của giảng
                viên {lecturerInfo.fullName}?
              </Alert>
            ) : (
              <Stack spacing={2}>
                <Alert severity="warning">
                  Bạn có chắc chắn muốn từ chối khóa học "{content.title}" của
                  giảng viên {lecturerInfo.fullName}?
                </Alert>
                <TextField
                  label="Lý do từ chối *"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Nhập lý do từ chối khóa học này..."
                  required
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={handleCloseConfirmDialog}
              variant="outlined"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={
                showConfirmDialog === "approve" ? handleApprove : handleReject
              }
              variant="contained"
              color={showConfirmDialog === "approve" ? "success" : "error"}
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              {loading
                ? "Đang xử lý..."
                : showConfirmDialog === "approve"
                  ? "Duyệt"
                  : "Từ chối"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default OwnedCourseCreateDialog;
