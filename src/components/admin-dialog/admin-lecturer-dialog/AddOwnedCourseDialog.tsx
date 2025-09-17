import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Autocomplete,
  Switch,
  FormControlLabel,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
} from "@mui/material";
import {
  Close,
  School,
  LocationOn,
  CalendarToday,
  AttachMoney,
  Public,
  Description,
  Category,
  Link as LinkIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { validateCourseForm } from "../../../utils/Validate";
import { specializationAutoComplete } from "../../../utils/AutoComplete";
import { API } from "../../../utils/Fetch";
import {
  courseTypes,
  languages,
  levels,
  scales,
} from "../../../utils/DropdownOption";
import type { OwnedCourse } from "../../../types/OwnedCourse";
import type { Lecturer } from "../../../types/Lecturer";
import { getCourseType, getScale } from "../../../utils/ChangeText";

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
    "0 20px 60px rgba(139, 92, 246, 0.15), 0 10px 30px rgba(0, 0, 0, 0.08)",
  outline: "none",
  border: "1px solid rgba(139, 92, 246, 0.08)",
  mx: {
    xs: 1,
    sm: 2,
    md: 0,
  },
};

interface AddOwnedCourseDialogProps {
  open: boolean;
  onClose: () => void;
  lecturer: Lecturer;
  onSuccess: () => void;
  editMode?: boolean;
  courseData?: OwnedCourse;
}

const AddOwnedCourseDialog: React.FC<AddOwnedCourseDialogProps> = ({
  open,
  onClose,
  lecturer,
  onSuccess,
  editMode = false,
  courseData,
}) => {
  const [form, setForm] = useState<OwnedCourse>({
    id: "",
    title: "",
    topic: "",
    courseType: "FORMAL",
    scale: "OTHERS",
    thumbnailUrl: "",
    contentUrl: "",
    level: "",
    requirements: "",
    language: "Vietnamese",
    isOnline: true,
    address: "",
    price: 0,
    startDate: "",
    endDate: "",
    description: "",
    courseUrl: "",
    status: "",
    adminNote: "",
    createdAt: "",
    updatedAt: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setForm({
        id: "",
        title: "",
        topic: "",
        courseType: "FORMAL",
        scale: "OTHERS",
        thumbnailUrl: "",
        contentUrl: "",
        level: "",
        requirements: "",
        language: "Vietnamese",
        isOnline: true,
        address: "",
        price: 0,
        startDate: "",
        endDate: "",
        description: "",
        courseUrl: "",
        status: "",
        adminNote: "",
        createdAt: "",
        updatedAt: "",
      });
      setSelectedFile(null);
    } else if (open && editMode && courseData) {
      // Initialize form with existing course data for edit mode
      setForm({
        id: courseData.id || "",
        title: courseData.title || "",
        topic: courseData.topic || "",
        courseType: courseData.courseType || "FORMAL",
        scale: courseData.scale || "OTHERS",
        thumbnailUrl: courseData.thumbnailUrl || "",
        contentUrl: courseData.contentUrl || "",
        level: courseData.level || "",
        requirements: courseData.requirements || "",
        language: courseData.language || "Vietnamese",
        isOnline: courseData.isOnline ?? true,
        address: courseData.address || "",
        price: courseData.price || 0,
        startDate: courseData.startDate || "",
        endDate: courseData.endDate || "",
        description: courseData.description || "",
        courseUrl: courseData.courseUrl || "",
        status: courseData.status || "",
        adminNote: courseData.adminNote || "",
        createdAt: courseData.createdAt || "",
        updatedAt: courseData.updatedAt || "",
      });
    }
  }, [open, editMode, courseData]);

  const handleChange = (
    field: keyof OwnedCourse,
    value: string | number | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // File upload functions
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const response = await API.user.uploadFileToServer(file);
      const uploadedUrl = response.data;
      setForm((prev) => ({ ...prev, thumbnailUrl: uploadedUrl }));
      toast.success("Tải lên tài liệu thành công");
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      toast.error("Tải lên tài liệu không thành công. (.pdf, .jpg, .png)");
    } finally {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // useEffect to handle file upload when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  }, [selectedFile]);

  const handleSubmit = async () => {
    console.log(form);
    
    const isValid = validateCourseForm(form);
    if (!isValid.success) {
      toast.error(isValid.error);
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
        // Update existing owned course
        response = await API.lecturer.updateOwnedCourse(form);
        
        if (response.data.success) {
          toast.success("Cập nhật khóa học sở hữu thành công!");
          onSuccess();
          onClose();
        } else {
          toast.error(response.data.message || "Có lỗi xảy ra khi cập nhật khóa học");
        }
      } else {
        // Create new owned course
        response = await API.admin.createOwnedCourse(form, lecturer.id);

        if (response.data.success) {
          toast.success("Thêm khóa học sở hữu thành công!");
          onSuccess();
          onClose();
        } else {
          toast.error(response.data.message || "Có lỗi xảy ra khi thêm khóa học");
        }
      }
    } catch (error: any) {
      console.error(`❌ Error ${editMode ? 'updating' : 'creating'} owned course:`, error);
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
          backgroundColor: "rgba(139, 92, 246, 0.4)",
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
              "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
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
              <School
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
                {editMode ? "Chỉnh sửa khóa học sở hữu" : `Thêm khóa học sở hữu cho ${lecturer?.fullName}`}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                }}
              >
                Thông tin về khóa học mà giảng viên sở hữu
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
              background: "#8B5CF6",
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
                    backgroundColor: "#F3E8FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <School sx={{ color: "#8B5CF6" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#8B5CF6",
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
                        borderColor: "#c4b5fd",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        borderColor: "#8B5CF6",
                        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#64748b",
                      "&.Mui-focused": {
                        color: "#8B5CF6",
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
                              borderColor: "#c4b5fd",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "#ffffff",
                              borderColor: "#8B5CF6",
                              boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "#64748b",
                            "&.Mui-focused": {
                              color: "#8B5CF6",
                            },
                          },
                        }}
                      />
                    )}
                  />

                  <FormControl fullWidth>
                    <InputLabel
                      id="course-type-label"
                      sx={{
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#8B5CF6",
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
                            border: "2px solid #c4b5fd",
                          },
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #8B5CF6",
                            boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                          },
                        },
                      }}
                    >
                      {courseTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {getCourseType(type)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <FormControl fullWidth>
                    <InputLabel
                      id="scale-label"
                      sx={{
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#8B5CF6",
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
                            border: "2px solid #c4b5fd",
                          },
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #8B5CF6",
                            boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                          },
                        },
                      }}
                    >
                      {scales.map((scale) => (
                        <MenuItem key={scale} value={scale}>
                          {getScale(scale)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel
                      id="level-label"
                      sx={{
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#8B5CF6",
                        },
                      }}
                    >
                      Cấp độ
                    </InputLabel>
                    <Select
                      labelId="level-label"
                      value={form.level}
                      label="Cấp độ"
                      onChange={(e) => handleChange("level", e.target.value)}
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
                            border: "2px solid #c4b5fd",
                          },
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #8B5CF6",
                            boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                          },
                        },
                      }}
                    >
                      {levels.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Box>

            {/* Section 2: Course Details */}
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
                  <Description sx={{ color: "#D97706" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#D97706",
                  }}
                >
                  Chi tiết khóa học
                </Typography>
              </Box>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Yêu cầu"
                  value={form.requirements}
                  onChange={(e) => handleChange("requirements", e.target.value)}
                  variant="outlined"
                  size="medium"
                  multiline
                  rows={2}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      border: "2px solid transparent",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: "#f3f4f6",
                        borderColor: "#c4b5fd",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        borderColor: "#8B5CF6",
                        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#64748b",
                      "&.Mui-focused": {
                        color: "#8B5CF6",
                      },
                    },
                  }}
                />

                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <FormControl fullWidth>
                    <InputLabel
                      id="language-label"
                      sx={{
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#8B5CF6",
                        },
                      }}
                    >
                      Ngôn ngữ
                    </InputLabel>
                    <Select
                      labelId="language-label"
                      value={form.language}
                      label="Ngôn ngữ"
                      onChange={(e) => handleChange("language", e.target.value)}
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
                            border: "2px solid #c4b5fd",
                          },
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #8B5CF6",
                            boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                          },
                        },
                      }}
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang} value={lang}>
                          {lang}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Giá"
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      handleChange("price", parseFloat(e.target.value) || 0)
                    }
                    variant="outlined"
                    size="medium"
                    inputProps={{ min: 0 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney sx={{ color: "#64748b" }} />
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
                          borderColor: "#c4b5fd",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#8B5CF6",
                          boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#8B5CF6",
                        },
                      },
                    }}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isOnline}
                      onChange={(e) =>
                        handleChange("isOnline", e.target.checked)
                      }
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#8B5CF6",
                          "&:hover": {
                            backgroundColor: "rgba(139, 92, 246, 0.04)",
                          },
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "#8B5CF6",
                          },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Public sx={{ color: "#64748b" }} />
                      <Typography>Khóa học trực tuyến</Typography>
                    </Box>
                  }
                />

                {!form.isOnline && (
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    variant="outlined"
                    size="medium"
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
                          borderColor: "#c4b5fd",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#8B5CF6",
                          boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#8B5CF6",
                        },
                      },
                    }}
                  />
                )}
              </Stack>
            </Box>

            {/* Section 3: Schedule and Links */}
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
                  <CalendarToday sx={{ color: "#4F46E5" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#4F46E5",
                  }}
                >
                  Lịch trình và liên kết
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
                          borderColor: "#c4b5fd",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#8B5CF6",
                          boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#8B5CF6",
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
                          borderColor: "#c4b5fd",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#8B5CF6",
                          boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#8B5CF6",
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
                          borderColor: "#c4b5fd",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#8B5CF6",
                          boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#8B5CF6",
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="URL nội dung"
                    value={form.contentUrl}
                    onChange={(e) => handleChange("contentUrl", e.target.value)}
                    variant="outlined"
                    size="medium"
                    placeholder="https://example.com/course-content"
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
                          borderColor: "#c4b5fd",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#8B5CF6",
                          boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#8B5CF6",
                        },
                      },
                    }}
                  />
                </Box>

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
                        borderColor: "#c4b5fd",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        borderColor: "#8B5CF6",
                        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#64748b",
                      "&.Mui-focused": {
                        color: "#8B5CF6",
                      },
                    },
                  }}
                />

                {/* Thumbnail Upload */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "#64748b" }}
                  >
                    Hình ảnh thumbnail (tùy chọn)
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      border: "2px dashed #c4b5fd",
                      borderRadius: "12px",
                      backgroundColor: "#f8fafc",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#8B5CF6",
                        backgroundColor: "#f3f4f6",
                      },
                    }}
                  >
                    {form.thumbnailUrl ? (
                      <Avatar
                        src={form.thumbnailUrl}
                        sx={{ width: 60, height: 60 }}
                      />
                    ) : (
                      <Avatar
                        sx={{ width: 60, height: 60, bgcolor: "#8B5CF6" }}
                      >
                        <School />
                      </Avatar>
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {form.thumbnailUrl
                          ? "Thumbnail đã tải lên"
                          : "Chưa có thumbnail"}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          textTransform: "none",
                          borderColor: "#8B5CF6",
                          color: "#8B5CF6",
                          "&:hover": {
                            borderColor: "#7C3AED",
                            backgroundColor: "rgba(139, 92, 246, 0.04)",
                          },
                        }}
                      >
                        {form.thumbnailUrl ? "Thay đổi" : "Tải lên"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </Box>
                  </Box>
                </Box>
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
                "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
              color: "white",
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)",
                boxShadow: "0 8px 25px rgba(139, 92, 246, 0.4)",
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

export default AddOwnedCourseDialog;
