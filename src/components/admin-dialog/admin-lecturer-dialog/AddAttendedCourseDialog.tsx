import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  Group,
  Category,
  LocationOn,
  CalendarToday,
  Business,
  Schedule,
  Link as LinkIcon,
  Description,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { specializationAutoComplete } from "../../../utils/AutoComplete";
import { courseTypes, scales } from "../../../utils/DropdownOption";
import { validateAttendedCourseForm } from "../../../utils/Validate";
import { API } from "../../../utils/Fetch";
import type { AttendedCourse } from "../../../types/AttendedCourse";
import type { Lecturer } from "../../../types/Lecturer";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "95vw",
    sm: "90vw",
    md: 750,
    lg: 750,
    xl: 750,
  },
  maxWidth: "750px",
  maxHeight: {
    xs: "90vh",
    sm: "95vh",
  },
  overflow: "hidden",
  bgcolor: "#ffffff",
  borderRadius: {
    xs: "12px",
    sm: "16px",
  },
  boxShadow:
    "0 20px 60px rgba(20, 184, 166, 0.15), 0 10px 30px rgba(0, 0, 0, 0.08)",
  outline: "none",
  border: "1px solid rgba(20, 184, 166, 0.08)",
  mx: {
    xs: 1,
    sm: 2,
    md: 0,
  },
};

interface AddAttendedCourseDialogProps {
  open: boolean;
  onClose: () => void;
  lecturer: Lecturer;
  onSuccess: () => void;
  editMode?: boolean;
  courseData?: AttendedCourse;
}

const AddAttendedCourseDialog: React.FC<AddAttendedCourseDialogProps> = ({
  open,
  onClose,
  lecturer,
  onSuccess,
  editMode = false,
  courseData,
}) => {
  const [form, setForm] = useState<AttendedCourse>({
    id: "",
    title: "",
    topic: "",
    organizer: "",
    courseType: "FORMAL",
    scale: "UNIVERSITY",
    startDate: "",
    endDate: "",
    numberOfHour: 0,
    location: "",
    description: "",
    courseUrl: "",
    status: "",
    adminNote: "",
    createdAt: "",
    updatedAt: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({
        id: "",
        title: "",
        topic: "",
        organizer: "",
        courseType: "FORMAL",
        scale: "UNIVERSITY",
        startDate: "",
        endDate: "",
        numberOfHour: 0,
        location: "",
        description: "",
        courseUrl: "",
        status: "",
        adminNote: "",
        createdAt: "",
        updatedAt: "",
      });
    } else if (open && editMode && courseData) {
      // Initialize form with existing course data for edit mode
      setForm({
        id: courseData.id || "",
        title: courseData.title || "",
        topic: courseData.topic || "",
        organizer: courseData.organizer || "",
        courseType: courseData.courseType || "FORMAL",
        scale: courseData.scale || "UNIVERSITY",
        startDate: courseData.startDate || "",
        endDate: courseData.endDate || "",
        numberOfHour: courseData.numberOfHour || 0,
        location: courseData.location || "",
        description: courseData.description || "",
        courseUrl: courseData.courseUrl || "",
        status: courseData.status || "",
        adminNote: courseData.adminNote || "",
        createdAt: courseData.createdAt || "",
        updatedAt: courseData.updatedAt || "",
      });
    }
  }, [open, editMode, courseData]);

  const handleChange = (field: keyof AttendedCourse, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const validation = validateAttendedCourseForm(form);
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    if (!editMode && !lecturer?.id) {
      toast.error("Không tìm thấy thông tin giảng viên");
      return;
    }

    if (editMode && !courseData?.id) {
      toast.error("Không tìm thấy thông tin khóa học cần chỉnh sửa");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (editMode) {
        // Update existing attended course
        response = await API.lecturer.updateAttendedCourse(form);
        
        if (response.data.success) {
          toast.success("Cập nhật khóa học đã tham gia thành công!");
          onSuccess();
          onClose();
        } else {
          toast.error(response.data.message || "Có lỗi xảy ra khi cập nhật khóa học");
        }
      } else {
        // Create new attended course
        response = await API.admin.createAttendedCourse(form, lecturer.id);

        if (response.data.success) {
          toast.success("Thêm khóa học đã tham gia thành công!");
          onSuccess();
          onClose();
        } else {
          toast.error(response.data.message || "Có lỗi xảy ra khi thêm khóa học");
        }
      }
    } catch (error: any) {
      console.error(`❌ Error ${editMode ? 'updating' : 'creating'} attended course:`, error);
      toast.error(
        error.response?.data?.message || `Có lỗi xảy ra khi ${editMode ? 'cập nhật' : 'thêm'} khóa học!`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(20, 184, 166, 0.4)",
          backdropFilter: "blur(8px)",
        },
      }}
    >
      <Box sx={style}>
        {/* Modern Header with Gradient */}
        <Box
          sx={{
            position: "relative",
            background:
              "linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0F766E 100%)",
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            borderRadius: {
              xs: "12px 12px 0 0",
              sm: "16px 16px 0 0",
            },
            color: "white",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: {
                xs: "60px",
                md: "100px",
              },
              height: {
                xs: "60px",
                md: "100px",
              },
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              transform: {
                xs: "translate(20px, -20px)",
                md: "translate(30px, -30px)",
              },
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              width: {
                xs: "40px",
                md: "60px",
              },
              height: {
                xs: "40px",
                md: "60px",
              },
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: "50%",
              transform: {
                xs: "translate(-15px, 15px)",
                md: "translate(-20px, 20px)",
              },
            },
          }}
        >
          {/* Close Button */}
          <Button
            onClick={onClose}
            sx={{
              position: "absolute",
              top: {
                xs: 8,
                md: 12,
              },
              right: {
                xs: 8,
                md: 12,
              },
              zIndex: 10,
              minWidth: "auto",
              width: {
                xs: 32,
                md: 40,
              },
              height: {
                xs: 32,
                md: 40,
              },
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                transform: "scale(1.05)",
              },
            }}
          >
            <Close />
          </Button>

          {/* Header Content */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: {
                xs: 1.5,
                md: 2,
              },
              mb: 1,
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              textAlign: {
                xs: "center",
                sm: "left",
              },
            }}
          >
            <Box
              sx={{
                p: {
                  xs: 1,
                  md: 1.5,
                },
                borderRadius: {
                  xs: "10px",
                  md: "12px",
                },
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Group
                sx={{
                  color: "white",
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  mb: 0.5,
                }}
              >
                {editMode ? "Chỉnh sửa khóa học đã tham gia" : `Thêm khóa học đã tham gia cho ${lecturer?.fullName}`}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                }}
              >
                Thông tin về khóa đào tạo mà giảng viên đã tham gia
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Form Content */}
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            maxHeight: {
              xs: "calc(70vh - 90px)",
              sm: "calc(70vh - 90px)",
            },
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#14B8A6",
              borderRadius: "3px",
            },
          }}
        >
          <Stack spacing={3}>
            {/* Section 1: Basic Information */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "8px",
                    backgroundColor: "#F0FDF4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Group sx={{ color: "#0D9488" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#0D9488",
                  }}
                >
                  Thông tin cơ bản
                </Typography>
              </Box>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Tiêu đề khóa học"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  variant="outlined"
                  size="medium"
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "2px solid transparent",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                        borderColor: "#a7f3d0",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        borderColor: "#14B8A6",
                        boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#64748b",
                      "&.Mui-focused": {
                        color: "#14B8A6",
                      },
                    },
                  }}
                />

                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <Autocomplete
                    fullWidth
                    options={specializationAutoComplete}
                    value={form.topic}
                    onChange={(_, newValue) =>
                      handleChange("topic", newValue || "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Chủ đề"
                        variant="outlined"
                        size="medium"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <Category sx={{ color: "#64748b" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "#f8fafc",
                            border: "2px solid transparent",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              backgroundColor: "#f3f4f6",
                              borderColor: "#a7f3d0",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "#ffffff",
                              borderColor: "#14B8A6",
                              boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "#64748b",
                            "&.Mui-focused": {
                              color: "#14B8A6",
                            },
                          },
                        }}
                      />
                    )}
                  />

                  <TextField
                    fullWidth
                    label="Đơn vị tổ chức"
                    value={form.organizer}
                    onChange={(e) => handleChange("organizer", e.target.value)}
                    variant="outlined"
                    size="medium"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business sx={{ color: "#64748b" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        border: "2px solid transparent",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: "#f3f4f6",
                          borderColor: "#a7f3d0",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#14B8A6",
                          boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#14B8A6",
                        },
                      },
                    }}
                  />
                </Box>

                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <FormControl fullWidth>
                    <InputLabel
                      id="course-type-label"
                      sx={{
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#14B8A6",
                        },
                      }}
                    >
                      Loại khóa học
                    </InputLabel>
                    <Select
                      labelId="course-type-label"
                      value={form.courseType}
                      label="Loại khóa học"
                      onChange={(e) =>
                        handleChange("courseType", e.target.value)
                      }
                      size="medium"
                      sx={{
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        border: "2px solid transparent",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "&:hover": {
                          backgroundColor: "#f3f4f6",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #a7f3d0",
                          },
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #14B8A6",
                            boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                          },
                        },
                      }}
                    >
                      {courseTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type === "FORMAL"
                            ? "Chính quy"
                            : type === "SPECIALIZED"
                              ? "Chuyên đề"
                              : type === "EXTRACURRICULAR"
                                ? "Ngoại khóa"
                                : type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel
                      id="scale-label"
                      sx={{
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#14B8A6",
                        },
                      }}
                    >
                      Quy mô
                    </InputLabel>
                    <Select
                      labelId="scale-label"
                      value={form.scale}
                      label="Quy mô"
                      onChange={(e) => handleChange("scale", e.target.value)}
                      size="medium"
                      sx={{
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        border: "2px solid transparent",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "&:hover": {
                          backgroundColor: "#f3f4f6",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #a7f3d0",
                          },
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #14B8A6",
                            boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                          },
                        },
                      }}
                    >
                      {scales.map((scale) => (
                        <MenuItem key={scale} value={scale}>
                          {scale === "INSTITUTIONAL"
                            ? "Cấp cơ sở"
                            : scale === "UNIVERSITY"
                              ? "Cấp trường"
                              : scale === "DEPARTMENTAL"
                                ? "Cấp tỉnh/thành"
                                : scale === "MINISTERIAL"
                                  ? "Cấp bộ"
                                  : scale === "NATIONAL"
                                    ? "Cấp quốc gia"
                                    : scale === "INTERNATIONAL"
                                      ? "Quốc tế"
                                      : scale === "OTHERS"
                                        ? "Khác"
                                        : scale}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Box>

            {/* Section 2: Time and Duration */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "8px",
                    backgroundColor: "#FEF3C7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarToday sx={{ color: "#D97706" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#D97706",
                  }}
                >
                  Thời gian và thời lượng
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <TextField
                    fullWidth
                    label="Ngày bắt đầu"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="medium"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: "#64748b" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        border: "2px solid transparent",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: "#f3f4f6",
                          borderColor: "#a7f3d0",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#14B8A6",
                          boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#14B8A6",
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Ngày kết thúc"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="medium"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: "#64748b" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        border: "2px solid transparent",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: "#f3f4f6",
                          borderColor: "#a7f3d0",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#14B8A6",
                          boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#14B8A6",
                        },
                      },
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Số giờ học"
                  type="number"
                  value={form.numberOfHour}
                  onChange={(e) =>
                    handleChange("numberOfHour", parseInt(e.target.value) || 0)
                  }
                  variant="outlined"
                  size="medium"
                  required
                  inputProps={{ min: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Schedule sx={{ color: "#64748b" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "2px solid transparent",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                        borderColor: "#a7f3d0",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        borderColor: "#14B8A6",
                        boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#64748b",
                      "&.Mui-focused": {
                        color: "#14B8A6",
                      },
                    },
                  }}
                />
              </Stack>
            </Box>

            {/* Section 3: Location and Details */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "8px",
                    backgroundColor: "#E0E7FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LocationOn sx={{ color: "#4F46E5" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#4F46E5",
                  }}
                >
                  Địa điểm và chi tiết
                </Typography>
              </Box>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Địa điểm"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  variant="outlined"
                  size="medium"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: "#64748b" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "2px solid transparent",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                        borderColor: "#a7f3d0",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        borderColor: "#14B8A6",
                        boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#64748b",
                      "&.Mui-focused": {
                        color: "#14B8A6",
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Mô tả"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  variant="outlined"
                  size="medium"
                  multiline
                  rows={3}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 1 }}
                      >
                        <Description sx={{ color: "#64748b" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "2px solid transparent",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                        borderColor: "#a7f3d0",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        borderColor: "#14B8A6",
                        boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#64748b",
                      "&.Mui-focused": {
                        color: "#14B8A6",
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="URL khóa học"
                  value={form.courseUrl}
                  onChange={(e) => handleChange("courseUrl", e.target.value)}
                  variant="outlined"
                  size="medium"
                  placeholder="https://example.com/course-page"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon sx={{ color: "#64748b" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "2px solid transparent",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                        borderColor: "#a7f3d0",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        borderColor: "#14B8A6",
                        boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#64748b",
                      "&.Mui-focused": {
                        color: "#14B8A6",
                      },
                    },
                  }}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Footer Buttons */}
        <Box
          sx={{
            p: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            pt: 2,
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            size="large"
            disabled={isSubmitting}
            sx={{
              minWidth: {
                xs: "100%",
                sm: 120,
              },
              py: 1.5,
              borderColor: "#d1d5db",
              color: "#6b7280",
              textTransform: "none",
              borderRadius: 2,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
                transform: {
                  xs: "none",
                  md: "translateY(-2px)",
                },
              },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              minWidth: {
                xs: "100%",
                sm: 120,
              },
              py: 1.5,
              background:
                "linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0F766E 100%)",
              color: "white",
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(20, 184, 166, 0.3)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #0D9488 0%, #0F766E 50%, #134E4A 100%)",
                boxShadow: "0 8px 25px rgba(20, 184, 166, 0.4)",
                transform: {
                  xs: "none",
                  md: "translateY(-2px)",
                },
              },
              "&:disabled": {
                background: "#9ca3af",
                boxShadow: "none",
              },
            }}
          >
            {isSubmitting 
              ? (editMode ? "Đang cập nhật..." : "Đang tạo...") 
              : (editMode ? "Cập nhật khóa học" : "Thêm khóa học")
            }
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddAttendedCourseDialog;
