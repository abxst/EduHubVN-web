import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Modal,
  Chip,
  Autocomplete,
} from "@mui/material";
import {
  CloudUpload,
  Assignment,
  AttachFile,
  CalendarToday,
  Business,
  Close,
} from "@mui/icons-material";
import type { CertificationRequest } from "../../../types/CertificationRequest";
import { API } from "../../../utils/Fetch";
import { Stack } from "@mui/system";
import { toast } from "react-toastify";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { vi } from "date-fns/locale/vi";
import { validateCertificateInfo } from "../../../utils/Validate";
import { certificationLevelsAutoComplete } from "../../../utils/AutoComplete";

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "95vw", // Mobile: 95% of viewport width
    sm: "90vw", // Small tablet: 90% of viewport width
    md: 750, // Medium and up: fixed 750px
    lg: 750,
    xl: 750,
  },
  maxWidth: "750px",
  maxHeight: {
    xs: "90vh", // Mobile: 90% of viewport height
    sm: "95vh", // Tablet and up: 95% of viewport height
  },
  overflow: "hidden",
  bgcolor: "#ffffff",
  borderRadius: {
    xs: "12px", // Mobile: smaller border radius
    sm: "16px", // Tablet and up: larger border radius
  },
  boxShadow:
    "0 20px 60px rgba(15, 118, 110, 0.15), 0 10px 30px rgba(0, 0, 0, 0.08)",
  outline: "none",
  border: "1px solid rgba(20, 184, 166, 0.08)",
  mx: {
    xs: 1, // Mobile: margin on sides
    sm: 2, // Tablet: more margin
    md: 0, // Desktop: no margin needed
  },
};

interface AddCertificationDialogProps {
  open: boolean;
  onClose: () => void;
  lecturer: any;
  onSuccess: () => void;
  editMode?: boolean;
  certificationData?: any;
}

const AddCertificationDialog: React.FC<AddCertificationDialogProps> = ({
  open,
  onClose,
  lecturer,
  onSuccess,
  editMode = false,
  certificationData,
}) => {
  const [form, setForm] = useState<CertificationRequest>({
    referenceId: "",
    name: "",
    issuedBy: "",
    issueDate: new Date(),
    expiryDate: null as Date | null,
    certificateUrl: "",
    level: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({
        referenceId: "",
        name: "",
        issuedBy: "",
        issueDate: new Date(),
        expiryDate: null,
        certificateUrl: "",
        level: "",
        description: "",
      });
      setSelectedFile(null);
      setIsUploading(false);
      setIsSubmitting(false);
    } else if (open && editMode && certificationData) {
      // Initialize form with existing certification data for edit mode
      setForm({
        referenceId: certificationData.referenceId || "",
        name: certificationData.name || "",
        issuedBy: certificationData.issuedBy || "",
        issueDate: certificationData.issueDate ? new Date(certificationData.issueDate) : new Date(),
        expiryDate: certificationData.expiryDate ? new Date(certificationData.expiryDate) : null,
        certificateUrl: certificationData.certificateUrl || "",
        level: certificationData.level || "",
        description: certificationData.description || "",
      });
    }
  }, [open, editMode, certificationData]);

  const handleChange = (field: keyof CertificationRequest, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Tự động tải lên file ngay khi chọn
      setIsUploading(true);
      await API.user
        .uploadFileToServer(file)
        .then((res: any) => {
          setForm((prev) => ({ ...prev, certificateUrl: res.data }));
          toast.success("Tải lên tài liệu thành công");
        })
        .catch((err) => {
          console.error("❌ Error uploading file:", err);
          toast.error("Tải lên tài liệu không thành công. (.pdf, .jpg, .png)");
          setSelectedFile(null);
          setForm((prev) => ({ ...prev, certificateUrl: "" }));
        })
        .finally(() => {
          setIsUploading(false);
        });
    }
  };

  const handleSubmit = async () => {
    const results = validateCertificateInfo(form);

    if (!results.success) {
      toast.error(results.error);
      return;
    }

    if (!editMode && !lecturer?.id) {
      toast.error("Không tìm thấy thông tin giảng viên");
      return;
    }

    if (editMode && !certificationData?.id) {
      toast.error("Không tìm thấy thông tin chứng chỉ cần chỉnh sửa");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (editMode) {
        // Update existing certification
        const updateData = {
          id: certificationData.id,
          referenceId: form.referenceId,
          name: form.name,
          issuedBy: form.issuedBy,
          issueDate: form.issueDate.toISOString(),
          expiryDate: form.expiryDate ? form.expiryDate.toISOString() : "",
          certificateUrl: form.certificateUrl,
          level: form.level,
          description: form.description,
          adminNote: certificationData.adminNote || "",
          status: certificationData.status || "PENDING",
          createdAt: certificationData.createdAt || "",
          updatedAt: certificationData.updatedAt || "",
        };
        response = await API.user.updateCertification(updateData);
        
        if (response.data.success) {
          toast.success("Cập nhật chứng chỉ thành công!");
          onSuccess();
          onClose();
        } else {
          toast.error(response.data.message || "Có lỗi xảy ra khi cập nhật chứng chỉ");
        }
      } else {
        // Create new certification
        response = await API.admin.createCertification(form, lecturer.id);

        if (response.data.success) {
          toast.success("Thêm chứng chỉ thành công!");
          onSuccess();
          onClose();
        } else {
          toast.error(response.data.message || "Thêm chứng chỉ thất bại!");
        }
      }
    } catch (error: any) {
      console.error(`❌ Error ${editMode ? 'updating' : 'creating'} certification:`, error);
      toast.error(error.message || `Có lỗi xảy ra khi ${editMode ? 'cập nhật' : 'thêm'} chứng chỉ!`);
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
          backgroundColor: "rgba(15, 118, 110, 0.4)",
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
              "linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)",
            p: {
              xs: 2, // Mobile: less padding
              sm: 3, // Tablet: medium padding
              md: 4, // Desktop: full padding
            },
            borderRadius: {
              xs: "12px 12px 0 0", // Mobile: smaller radius
              sm: "16px 16px 0 0", // Tablet and up: larger radius
            },
            color: "white",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: {
                xs: "60px", // Mobile: smaller decorative elements
                md: "100px", // Desktop: larger decorative elements
              },
              height: {
                xs: "60px",
                md: "100px",
              },
              background:
                "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              borderRadius: "50%",
              transform: "translate(30%, -30%)",
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
              background:
                "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
              borderRadius: "50%",
              transform: "translate(-30%, 30%)",
            },
          }}
        >
          {/* Close Button */}
          <Button
            onClick={onClose}
            sx={{
              position: "absolute",
              top: {
                xs: 8, // Mobile: closer to edge
                md: 16, // Desktop: more spacing
              },
              right: {
                xs: 8,
                md: 16,
              },
              minWidth: "auto",
              width: {
                xs: 32, // Mobile: smaller button
                md: 40, // Desktop: larger button
              },
              height: {
                xs: 32,
                md: 40,
              },
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <Close
              sx={{
                fontSize: {
                  xs: 18, // Mobile: smaller icon
                  md: 20, // Desktop: larger icon
                },
              }}
            />
          </Button>

          {/* Header Content */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: {
                xs: 2, // Mobile: smaller gap
                md: 3, // Desktop: larger gap
              },
              position: "relative",
              zIndex: 1,
              flexDirection: {
                xs: "column", // Mobile: stack vertically
                sm: "row", // Tablet and up: horizontal
              },
              textAlign: {
                xs: "center", // Mobile: center align
                sm: "left", // Tablet and up: left align
              },
            }}
          >
            <Box
              sx={{
                width: {
                  xs: 48, // Mobile: smaller icon container
                  md: 56, // Desktop: larger icon container
                },
                height: {
                  xs: 48,
                  md: 56,
                },
                borderRadius: {
                  xs: "10px", // Mobile: smaller radius
                  md: "12px", // Desktop: larger radius
                },
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Assignment
                sx={{
                  fontSize: {
                    xs: 24, // Mobile: smaller icon
                    md: 28, // Desktop: larger icon
                  },
                  color: "white",
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  fontSize: {
                    xs: "1.25rem", // Mobile: smaller text
                    sm: "1.5rem", // Tablet: medium text
                    md: "1.75rem", // Desktop: larger text
                  },
                  letterSpacing: "-0.02em",
                  mb: 0.5,
                }}
              >
                {editMode ? "Chỉnh sửa chứng chỉ" : "Thêm chứng chỉ cho giảng viên"}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontSize: {
                    xs: "0.875rem", // Mobile: smaller text
                    md: "1rem", // Desktop: larger text
                  },
                  fontWeight: 400,
                }}
              >
                {editMode ? `Chỉnh sửa chứng chỉ cho ${lecturer?.fullName || "giảng viên"}` : `Thêm chứng chỉ mới cho giảng viên ${lecturer?.fullName}`}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Scrollable Content */}
        <Box
          sx={{
            maxHeight: {
              xs: "calc(75vh - 90px)", // Mobile: adjust for smaller header
              sm: "calc(80vh - 120px)", // Tablet: adjust for medium header
              md: "calc(80vh - 150px)", // Desktop: original calculation
            },
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: {
                xs: "4px", // Mobile: thinner scrollbar
                md: "6px", // Desktop: original width
              },
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f1f5f9",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#06b6d4",
              borderRadius: "3px",
            },
          }}
        >
          <Box
            sx={{
              p: {
                xs: 2, // Mobile: less padding
                sm: 3, // Tablet: medium padding
                md: 4, // Desktop: full padding
              },
              pt: {
                xs: 2, // Mobile: consistent top padding
                md: 3, // Desktop: slightly more top padding
              },
            }}
          >
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={vi}
            >
              <Stack
                spacing={{
                  xs: 2, // Mobile: less spacing
                  md: 3, // Desktop: more spacing
                }}
              >
                {/* Basic Information Section */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: {
                        xs: 1, // Mobile: smaller gap
                        md: 1.5, // Desktop: larger gap
                      },
                      mb: {
                        xs: 2, // Mobile: less margin
                        md: 3, // Desktop: more margin
                      },
                      pb: 1,
                      borderBottom: "2px solid #ecfeff",
                      flexDirection: {
                        xs: "column", // Mobile: stack vertically
                        sm: "row", // Tablet and up: horizontal
                      },
                      textAlign: {
                        xs: "center", // Mobile: center align
                        sm: "left", // Tablet and up: left align
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: {
                          xs: 32, // Mobile: smaller icon container
                          md: 40, // Desktop: larger icon container
                        },
                        height: {
                          xs: 32,
                          md: 40,
                        },
                        borderRadius: {
                          xs: "8px", // Mobile: smaller radius
                          md: "10px", // Desktop: larger radius
                        },
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: {
                          xs: "14px", // Mobile: smaller emoji
                          md: "18px", // Desktop: larger emoji
                        },
                      }}
                    >
                      📋
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#0e7490",
                        fontWeight: 700,
                        fontSize: {
                          xs: "1rem", // Mobile: smaller text
                          md: "1.25rem", // Desktop: larger text
                        },
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Thông tin cơ bản
                    </Typography>
                  </Box>
                  <Stack
                    spacing={{
                      xs: 2, // Mobile: less spacing
                      md: 3, // Desktop: more spacing
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Mã tham chiếu"
                      value={form.referenceId}
                      onChange={(e) =>
                        handleChange("referenceId", e.target.value)
                      }
                      variant="outlined"
                      size="medium"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: {
                            xs: "8px", // Mobile: smaller radius
                            md: "12px", // Desktop: larger radius
                          },
                          backgroundColor: "#f8fafc",
                          transition: "all 0.2s ease-in-out",
                          fontSize: {
                            xs: "0.875rem", // Mobile: smaller font
                            md: "1rem", // Desktop: normal font
                          },
                          "&:hover": {
                            backgroundColor: "#ecfeff",
                            borderColor: "#67e8f9",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "#ffffff",
                            boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.1)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#64748b",
                          fontWeight: 500,
                          fontSize: {
                            xs: "0.875rem", // Mobile: smaller label
                            md: "1rem", // Desktop: normal label
                          },
                          "&.Mui-focused": {
                            color: "#06b6d4",
                          },
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Tên chứng chỉ"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      variant="outlined"
                      size="medium"
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: {
                            xs: "8px",
                            md: "12px",
                          },
                          backgroundColor: "#f8fafc",
                          transition: "all 0.2s ease-in-out",
                          fontSize: {
                            xs: "0.875rem",
                            md: "1rem",
                          },
                          "&:hover": {
                            backgroundColor: "#ecfeff",
                            borderColor: "#67e8f9",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "#ffffff",
                            boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.1)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#64748b",
                          fontWeight: 500,
                          fontSize: {
                            xs: "0.875rem",
                            md: "1rem",
                          },
                          "&.Mui-focused": {
                            color: "#06b6d4",
                          },
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Cơ quan cấp"
                      value={form.issuedBy}
                      onChange={(e) => handleChange("issuedBy", e.target.value)}
                      variant="outlined"
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <Business sx={{ mr: 1, color: "#64748b" }} />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          backgroundColor: "#f8fafc",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            backgroundColor: "#ecfeff",
                            borderColor: "#67e8f9",
                          },
                          "&.Mui-focused": {
                            backgroundColor: "#ffffff",
                            boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.1)",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#64748b",
                          fontWeight: 500,
                          "&.Mui-focused": {
                            color: "#06b6d4",
                          },
                        },
                      }}
                    />

                    <Autocomplete
                      fullWidth
                      options={certificationLevelsAutoComplete}
                      value={form.level}
                      onChange={(_, newValue) => {
                        handleChange("level", newValue || "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cấp độ chứng chỉ"
                          variant="outlined"
                          size="medium"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              backgroundColor: "#f8fafc",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                backgroundColor: "#ecfeff",
                                borderColor: "#67e8f9",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#ffffff",
                                boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.1)",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color: "#64748b",
                              fontWeight: 500,
                              "&.Mui-focused": {
                                color: "#06b6d4",
                              },
                            },
                          }}
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-tag": {
                          backgroundColor: "#06b6d4",
                          color: "white",
                          borderRadius: "6px",
                        },
                      }}
                    />
                  </Stack>
                </Box>

                {/* Date Section */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3,
                      pb: 1,
                      borderBottom: "2px solid #ecfeff",
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      📅
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#0e7490",
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Thời gian
                    </Typography>
                  </Box>
                  <Box
                    display="flex"
                    gap={2}
                    flexDirection={{
                      xs: "column",
                      sm: "row",
                    }}
                  >
                    <DatePicker
                      label="Ngày cấp"
                      value={form.issueDate}
                      onChange={(newValue) =>
                        handleChange("issueDate", newValue)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "medium",
                          InputProps: {
                            startAdornment: (
                              <CalendarToday sx={{ mr: 1, color: "#64748b" }} />
                            ),
                          },
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              backgroundColor: "#f8fafc",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                backgroundColor: "#ecfeff",
                                borderColor: "#67e8f9",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#ffffff",
                                boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.1)",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color: "#64748b",
                              fontWeight: 500,
                              "&.Mui-focused": {
                                color: "#06b6d4",
                              },
                            },
                          },
                        },
                      }}
                    />
                    <DatePicker
                      label="Ngày hết hạn (tùy chọn)"
                      value={form.expiryDate}
                      onChange={(newValue) =>
                        handleChange("expiryDate", newValue)
                      }
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "medium",
                          InputProps: {
                            startAdornment: (
                              <CalendarToday sx={{ mr: 1, color: "#64748b" }} />
                            ),
                          },
                          sx: {
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "12px",
                              backgroundColor: "#f8fafc",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                backgroundColor: "#ecfeff",
                                borderColor: "#67e8f9",
                              },
                              "&.Mui-focused": {
                                backgroundColor: "#ffffff",
                                boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.1)",
                              },
                            },
                            "& .MuiInputLabel-root": {
                              color: "#64748b",
                              fontWeight: 500,
                              "&.Mui-focused": {
                                color: "#06b6d4",
                              },
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>

                {/* Description Section */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3,
                      pb: 1,
                      borderBottom: "2px solid #ecfeff",
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      📝
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#0e7490",
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Mô tả chi tiết
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Mô tả chứng chỉ"
                    value={form.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Nhập mô tả chi tiết về chứng chỉ..."
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        backgroundColor: "#f8fafc",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: "#ecfeff",
                          borderColor: "#67e8f9",
                        },
                        "&.Mui-focused": {
                          backgroundColor: "#ffffff",
                          boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.1)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#64748b",
                        fontWeight: 500,
                        "&.Mui-focused": {
                          color: "#06b6d4",
                        },
                      },
                    }}
                  />
                </Box>

                {/* Document Upload Section */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 3,
                      pb: 1,
                      borderBottom: "2px solid #ecfeff",
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background:
                          "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                      }}
                    >
                      📎
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#0e7490",
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Tài liệu đính kém
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      border: "2px dashed #cbd5e1",
                      borderRadius: "12px",
                      p: 4,
                      textAlign: "center",
                      backgroundColor: "#f8fafc",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: "#06b6d4",
                        backgroundColor: "#ecfeff",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(6, 182, 212, 0.1)",
                      },
                    }}
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    {isUploading ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                        }}
                      >
                        <CircularProgress size={24} sx={{ color: "#06b6d4" }} />
                        <Typography sx={{ color: "#64748b" }}>
                          Đang tải lên...
                        </Typography>
                      </Box>
                    ) : selectedFile ? (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <AttachFile sx={{ color: "#06b6d4" }} />
                          <Typography
                            sx={{
                              color: "#06b6d4",
                              fontWeight: 600,
                            }}
                          >
                            {selectedFile.name}
                          </Typography>
                        </Box>
                        <Chip
                          label="Đã tải lên thành công"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    ) : (
                      <Box>
                        <CloudUpload
                          sx={{
                            fontSize: 48,
                            color: "#cbd5e1",
                            mb: 2,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#64748b",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          Kéo thả hoặc nhấn để chọn tài liệu
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#94a3b8",
                          }}
                        >
                          Hỗ trợ: PDF, JPG, PNG (tối đa 10MB)
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Stack>
            </LocalizationProvider>
          </Box>
        </Box>

        {/* Footer with Actions */}
        <Box
          sx={{
            p: {
              xs: 2,
              md: 4,
            },
            pt: 2,
            background: "linear-gradient(135deg, #f8fafc 0%, #ecfeff 100%)",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <Box
            sx={{
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
              variant="outlined"
              onClick={onClose}
              disabled={isSubmitting}
              sx={{
                borderColor: "#cbd5e1",
                color: "#64748b",
                fontWeight: 600,
                borderRadius: "12px",
                px: 4,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": {
                  borderColor: "#94a3b8",
                  backgroundColor: "#f8fafc",
                },
                order: {
                  xs: 2,
                  sm: 1,
                },
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                background:
                  "linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%)",
                color: "white",
                fontWeight: 700,
                borderRadius: "12px",
                px: 4,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 4px 15px rgba(6, 182, 212, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #155e75 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(6, 182, 212, 0.4)",
                },
                "&:disabled": {
                  background: "#94a3b8",
                  transform: "none",
                  boxShadow: "none",
                },
                transition: "all 0.2s ease-in-out",
                order: {
                  xs: 1,
                  sm: 2,
                },
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: "white" }} />
                  <span>Đang xử lý...</span>
                </Box>
              ) : (
                editMode ? "Cập nhật chứng chỉ" : "Thêm chứng chỉ"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddCertificationDialog;
