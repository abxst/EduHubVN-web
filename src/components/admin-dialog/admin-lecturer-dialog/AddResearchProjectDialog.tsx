import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
  Stack,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  Science,
  CalendarToday,
  AttachMoney,
  Business,
  Person,
  Link as LinkIcon,
  Category,
  Description,
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { validateResearchProjectForm } from "../../../utils/Validate";
import { projectTypes, scales } from "../../../utils/DropdownOption";
import { getProjectType, getScale } from "../../../utils/ChangeText";
import type {
  ResearchProject,
  ResearchProjectRequest,
} from "../../../types/ResearchProject";
import type { Lecturer } from "../../../types/Lecturer";
import {
  industriesAutoComplete,
  researchProjectStatusAutoComplete,
} from "../../../utils/AutoComplete";
import { API } from "../../../utils/Fetch";

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
    "0 20px 60px rgba(19, 111, 180, 0.15), 0 10px 30px rgba(0, 0, 0, 0.08)",
  outline: "none",
  border: "1px solid rgba(19, 111, 180, 0.08)",
  mx: {
    xs: 1,
    sm: 2,
    md: 0,
  },
};

interface AddResearchProjectDialogProps {
  open: boolean;
  onClose: () => void;
  lecturer: Lecturer;
  onSuccess: () => void;
  editMode?: boolean;
  projectData?: ResearchProject;
}

const AddResearchProjectDialog: React.FC<AddResearchProjectDialogProps> = ({
  open,
  onClose,
  lecturer,
  onSuccess,
  editMode = false,
  projectData,
}) => {
  const [form, setForm] = useState<ResearchProject>({
    id: "",
    title: "",
    researchArea: "",
    scale: "OTHERS",
    startDate: "",
    endDate: "",
    foundingAmount: 0,
    foundingSource: "",
    projectType: "",
    roleInProject: "",
    publishedUrl: "",
    courseStatus: "",
    description: "",
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
        researchArea: "",
        scale: "OTHERS",
        startDate: "",
        endDate: "",
        foundingAmount: 0,
        foundingSource: "",
        projectType: "",
        roleInProject: "",
        publishedUrl: "",
        courseStatus: "",
        description: "",
        status: "",
        adminNote: "",
        createdAt: "",
        updatedAt: "",
      });
    } else if (open && editMode && projectData) {
      // Initialize form with existing project data for edit mode
      setForm({
        id: projectData.id || "",
        title: projectData.title || "",
        researchArea: projectData.researchArea || "",
        scale: projectData.scale || "OTHERS",
        startDate: projectData.startDate || "",
        endDate: projectData.endDate || "",
        foundingAmount: projectData.foundingAmount || 0,
        foundingSource: projectData.foundingSource || "",
        projectType: projectData.projectType || "",
        roleInProject: projectData.roleInProject || "",
        publishedUrl: projectData.publishedUrl || "",
        courseStatus: projectData.courseStatus || "",
        description: projectData.description || "",
        status: projectData.status || "",
        adminNote: projectData.adminNote || "",
        createdAt: projectData.createdAt || "",
        updatedAt: projectData.updatedAt || "",
      });
    }
  }, [open, editMode, projectData]);

  const handleChange = (
    field: keyof ResearchProjectRequest,
    value: string | number,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const validation = validateResearchProjectForm(form);
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    if (!editMode && !lecturer?.id) {
      toast.error("Không tìm thấy thông tin giảng viên");
      return;
    }

    if (editMode && !projectData?.id) {
      toast.error("Không tìm thấy thông tin dự án nghiên cứu cần chỉnh sửa");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (editMode) {
        // Update existing research project
        response = await API.lecturer.updateResearchProject(form);
        
        if (response.data.success) {
          toast.success("Cập nhật dự án nghiên cứu thành công!");
          onSuccess();
          onClose();
        } else {
          toast.error(response.data.message || "Có lỗi xảy ra khi cập nhật dự án nghiên cứu");
        }
      } else {
        // Create new research project
        response = await API.admin.createResearchProject(form, lecturer.id);

        if (response.data.success) {
          toast.success("Thêm dự án nghiên cứu thành công!");
          onSuccess();
          onClose();
        } else {
          toast.error(
            response.data.message || "Có lỗi xảy ra khi thêm dự án nghiên cứu",
          );
        }
      }
    } catch (error: any) {
      console.error(`❌ Error ${editMode ? 'updating' : 'creating'} research project:`, error);
      toast.error(
        error.response?.data?.message ||
          `Có lỗi xảy ra khi ${editMode ? 'cập nhật' : 'thêm'} dự án nghiên cứu!`,
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
          backgroundColor: "rgba(19, 111, 180, 0.4)",
          backdropFilter: "blur(8px)",
        },
      }}
    >
      <Box sx={style}>
        {/* Header */}
        <Box
          sx={{
            position: "relative",
            background:
              "linear-gradient(135deg, #136FB4 0%, #0F5A92 50%, #0B4872 100%)",
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
              <Science
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
                {editMode ? "Chỉnh sửa dự án nghiên cứu" : `Thêm dự án nghiên cứu cho ${lecturer?.fullName}`}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                }}
              >
                {editMode ? `Chỉnh sửa dự án nghiên cứu cho ${lecturer?.fullName || "giảng viên"}` : "Thông tin về dự án nghiên cứu khoa học"}
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
              background: "#136FB4",
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
                    backgroundColor: "#E3F2FD",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Science sx={{ color: "#136FB4" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#136FB4",
                  }}
                >
                  Thông tin cơ bản
                </Typography>
              </Box>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Tiêu đề dự án"
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
                        borderColor: "#BBDEFB",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        borderColor: "#136FB4",
                        boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#64748b",
                      "&.Mui-focused": {
                        color: "#136FB4",
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
                    options={industriesAutoComplete}
                    value={form.researchArea}
                    onChange={(_, newValue) =>
                      handleChange("researchArea", newValue || "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Lĩnh vực nghiên cứu"
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
                              borderColor: "#BBDEFB",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "#ffffff",
                              borderColor: "#136FB4",
                              boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "#64748b",
                            "&.Mui-focused": {
                              color: "#136FB4",
                            },
                          },
                        }}
                      />
                    )}
                  />

                  <FormControl fullWidth>
                    <InputLabel
                      id="scale-label"
                      sx={{
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#136FB4",
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
                            border: "2px solid #BBDEFB",
                          },
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #136FB4",
                            boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
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
                </Box>

                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <FormControl fullWidth>
                    <InputLabel
                      id="project-type-label"
                      sx={{
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#136FB4",
                        },
                      }}
                    >
                      Loại dự án
                    </InputLabel>
                    <Select
                      labelId="project-type-label"
                      value={form.projectType}
                      label="Loại dự án"
                      onChange={(e) =>
                        handleChange("projectType", e.target.value)
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
                            border: "2px solid #BBDEFB",
                          },
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "2px solid #136FB4",
                            boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                          },
                        },
                      }}
                    >
                      {projectTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {getProjectType(type)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Vai trò trong dự án"
                    value={form.roleInProject}
                    onChange={(e) =>
                      handleChange("roleInProject", e.target.value)
                    }
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "#64748b" }} />
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
                          borderColor: "#BBDEFB",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#136FB4",
                          boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#136FB4",
                        },
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Section 2: Time and Funding */}
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
                  Thời gian và tài trợ
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
                          borderColor: "#BBDEFB",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#136FB4",
                          boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#136FB4",
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
                          borderColor: "#BBDEFB",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#136FB4",
                          boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#136FB4",
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
                    label="Nguồn tài trợ"
                    value={form.foundingSource}
                    onChange={(e) =>
                      handleChange("foundingSource", e.target.value)
                    }
                    variant="outlined"
                    size="medium"
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
                          borderColor: "#BBDEFB",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#136FB4",
                          boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#136FB4",
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Số tiền tài trợ"
                    type="number"
                    value={form.foundingAmount}
                    onChange={(e) =>
                      handleChange(
                        "foundingAmount",
                        parseFloat(e.target.value) || 0,
                      )
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
                          borderColor: "#BBDEFB",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#136FB4",
                          boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#136FB4",
                        },
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Section 3: Additional Information */}
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
                  <Description sx={{ color: "#4F46E5" }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#4F46E5",
                  }}
                >
                  Thông tin bổ sung
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Box
                  display="flex"
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                >
                  <Autocomplete
                    fullWidth
                    options={researchProjectStatusAutoComplete}
                    value={form.courseStatus}
                    onChange={(_, newValue) =>
                      handleChange("courseStatus", newValue || "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Trạng thái dự án"
                        variant="outlined"
                        size="medium"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "#f8fafc",
                            border: "2px solid transparent",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              backgroundColor: "#f3f4f6",
                              borderColor: "#BBDEFB",
                            },
                            "&.Mui-focused": {
                              backgroundColor: "#ffffff",
                              borderColor: "#136FB4",
                              boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            color: "#64748b",
                            "&.Mui-focused": {
                              color: "#136FB4",
                            },
                          },
                        }}
                      />
                    )}
                  />

                  <TextField
                    fullWidth
                    label="URL công bố"
                    value={form.publishedUrl}
                    onChange={(e) =>
                      handleChange("publishedUrl", e.target.value)
                    }
                    variant="outlined"
                    size="medium"
                    placeholder="https://example.com/publication"
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
                          borderColor: "#BBDEFB",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          borderColor: "#136FB4",
                          boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        "&.Mui-focused": {
                          color: "#136FB4",
                        },
                      },
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Mô tả dự án"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  variant="outlined"
                  size="medium"
                  multiline
                  rows={4}
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
                        borderColor: "#BBDEFB",
                      },
                      "&.Mui-focused": {
                        backgroundColor: "#ffffff",
                        borderColor: "#136FB4",
                        boxShadow: "0 0 0 3px rgba(19, 111, 180, 0.1)",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#64748b",
                      "&.Mui-focused": {
                        color: "#136FB4",
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
                "linear-gradient(135deg, #136FB4 0%, #0F5A92 50%, #0B4872 100%)",
              color: "white",
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(19, 111, 180, 0.3)",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #0F5A92 0%, #0B4872 50%, #073956 100%)",
                boxShadow: "0 8px 25px rgba(19, 111, 180, 0.4)",
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
              : (editMode ? "Cập nhật dự án" : "Thêm dự án")
            }
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddResearchProjectDialog;
