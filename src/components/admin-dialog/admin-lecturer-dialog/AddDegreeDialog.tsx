import { AttachFile, CloudUpload, School, Close } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import React, { useState } from "react";
import { toast } from "react-toastify";
import type { DegreeRequest } from "../../../types/DegreeRequest";
import { API } from "../../../utils/Fetch";
import { validateDegreeInfo } from "../../../utils/Validate";
import {
  degreeLevelsAutoComplete,
  majorsAutoComplete,
} from "../../../utils/AutoComplete";

interface AddDegreeDialogProps {
  open: boolean;
  onClose: () => void;
  lecturer?: any;
  onSuccess?: () => void;
  editMode?: boolean;
  degreeData?: any;
}

const AddDegreeDialog: React.FC<AddDegreeDialogProps> = ({
  open,
  onClose,
  lecturer,
  onSuccess,
  editMode = false,
  degreeData,
}) => {
  const [form, setForm] = useState<DegreeRequest>({
    referenceId: "",
    name: "",
    major: "",
    institution: "",
    startYear: 0,
    graduationYear: 0,
    level: "",
    url: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Clear form when modal closes or initialize with edit data
  React.useEffect(() => {
    if (!open) {
      setForm({
        referenceId: "",
        name: "",
        major: "",
        institution: "",
        startYear: 0,
        graduationYear: 0,
        level: "",
        url: "",
        description: "",
      });
      setSelectedFile(null);
      setIsUploading(false);
      setIsSubmitting(false);
    } else if (open && editMode && degreeData) {
      // Initialize form with existing degree data for edit mode
      setForm({
        referenceId: degreeData.referenceId || "",
        name: degreeData.name || "",
        major: degreeData.major || "",
        institution: degreeData.institution || "",
        startYear: degreeData.startYear || 0,
        graduationYear: degreeData.graduationYear || 0,
        level: degreeData.level || "",
        url: degreeData.url || "",
        description: degreeData.description || "",
      });
    }
  }, [open, editMode, degreeData]);

  const handleChange = (field: keyof DegreeRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const results = validateDegreeInfo(form);

    if (!results.success) {
      toast.error(results.error);
      return;
    }

    if (!editMode && !lecturer?.id) {
      toast.error("Không tìm thấy thông tin giảng viên");
      return;
    }

    if (editMode && !degreeData?.id) {
      toast.error("Không tìm thấy thông tin bằng cấp cần chỉnh sửa");
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (editMode) {
        // Update existing degree
        const updateData = {
          id: degreeData.id,
          referenceId: form.referenceId,
          name: form.name,
          major: form.major,
          institution: form.institution,
          startYear: form.startYear,
          graduationYear: form.graduationYear,
          level: form.level,
          url: form.url,
          description: form.description,
          adminNote: degreeData.adminNote || "",
          status: degreeData.status || "PENDING",
          createdAt: degreeData.createdAt || "",
          updatedAt: degreeData.updatedAt || "",
        };
        response = await API.user.updateDegree(updateData);
        
        if (response.data.success) {
          toast.success("Cập nhật bằng cấp thành công!");
          onSuccess?.();
          onClose();
        } else {
          toast.error(response.data.message || "Có lỗi xảy ra khi cập nhật bằng cấp");
        }
      } else {
        // Create new degree
        response = await API.admin.createDegree(form, lecturer.id);

        if (response.data.success) {
          toast.success("Thêm bằng cấp thành công!");
          onSuccess?.();
          onClose();
        } else {
          toast.error(response.data.message || "Có lỗi xảy ra khi thêm bằng cấp");
        }
      }
    } catch (error: any) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} degree:`, error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi thêm bằng cấp",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Auto upload file when selected
      setIsUploading(true);
      try {
        const response = await API.user.uploadFileToServer(file);
        console.log("✅ File uploaded successfully:", response.data);
        setForm((prev) => ({ ...prev, url: response.data }));
        toast.success("Tải lên tài liệu thành công");
      } catch (error: any) {
        console.error("❌ Error uploading file:", error);
        toast.error("Tải lên tài liệu không thành công. (.pdf, .jpg, .png)");
        setSelectedFile(null);
        setForm((prev) => ({ ...prev, url: "" }));
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%)",
          color: "white",
          py: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <School />
          <Box>
            <Typography variant="h6" component="div">
              {editMode ? "Chỉnh sửa bằng cấp" : "Thêm bằng cấp mới"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {editMode ? `Chỉnh sửa bằng cấp cho ${lecturer?.fullName || "giảng viên"}` : `Thêm bằng cấp cho ${lecturer?.fullName}`}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* Reference ID và Tên bằng cấp */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <TextField
                fullWidth
                label="Mã tham chiếu"
                placeholder="Nhập mã tham chiếu (tùy chọn)"
                value={form.referenceId}
                onChange={(e) => handleChange("referenceId", e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                fullWidth
                label="Tên bằng cấp *"
                placeholder="VD: Bằng Cử nhân Công nghệ Thông tin"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                sx={{ flex: 2 }}
                required
              />
            </Box>

            {/* Chuyên ngành và Trình độ */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <Autocomplete
                fullWidth
                options={majorsAutoComplete}
                value={form.major}
                onChange={(_, newValue) =>
                  handleChange("major", newValue || "")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chuyên ngành *"
                    placeholder="Chọn hoặc nhập chuyên ngành"
                    required
                  />
                )}
                freeSolo
                sx={{ flex: 1 }}
              />
              <Autocomplete
                fullWidth
                options={degreeLevelsAutoComplete}
                value={form.level}
                onChange={(_, newValue) =>
                  handleChange("level", newValue || "")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Trình độ *"
                    placeholder="Chọn trình độ bằng cấp"
                    required
                  />
                )}
                sx={{ flex: 1 }}
              />
            </Box>

            {/* Trường/Tổ chức */}
            <TextField
              fullWidth
              label="Trường/Tổ chức cấp bằng *"
              placeholder="VD: Đại học Bách khoa Hà Nội"
              value={form.institution}
              onChange={(e) => handleChange("institution", e.target.value)}
              required
            />

            {/* Năm bắt đầu và Năm tốt nghiệp */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <TextField
                fullWidth
                label="Năm bắt đầu *"
                type="number"
                placeholder="VD: 2018"
                value={form.startYear || ""}
                onChange={(e) =>
                  handleChange("startYear", parseInt(e.target.value) || 0)
                }
                InputProps={{
                  inputProps: { min: 1950, max: new Date().getFullYear() },
                }}
                required
              />
              <TextField
                fullWidth
                label="Năm tốt nghiệp *"
                type="number"
                placeholder="VD: 2022"
                value={form.graduationYear || ""}
                onChange={(e) =>
                  handleChange("graduationYear", parseInt(e.target.value) || 0)
                }
                InputProps={{
                  inputProps: { min: 1950, max: new Date().getFullYear() + 10 },
                }}
                required
              />
            </Box>

            {/* Mô tả */}
            <TextField
              fullWidth
              label="Mô tả chi tiết"
              placeholder="Nhập mô tả về bằng cấp (tùy chọn)"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              multiline
              rows={3}
            />

            {/* Upload tài liệu */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Tài liệu đính kèm
              </Typography>
              <Box
                sx={{
                  border: "2px dashed #e0e0e0",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  backgroundColor: "#fafafa",
                  position: "relative",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#14b8a6",
                    backgroundColor: "#f0fdfa",
                  },
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                  disabled={isUploading}
                />

                {isUploading ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <CircularProgress size={40} sx={{ color: "#14b8a6" }} />
                    <Typography variant="body2" color="text.secondary">
                      Đang tải lên...
                    </Typography>
                  </Box>
                ) : selectedFile ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <AttachFile sx={{ fontSize: 40, color: "#14b8a6" }} />
                    <Chip
                      label={selectedFile.name}
                      onDelete={() => {
                        setSelectedFile(null);
                        setForm((prev) => ({ ...prev, url: "" }));
                      }}
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="body2" color="success.main">
                      Tải lên thành công!
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <CloudUpload sx={{ fontSize: 40, color: "#bdbdbd" }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Kéo thả file vào đây hoặc nhấn để chọn
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hỗ trợ: PDF, JPG, PNG (tối đa 10MB)
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                pt: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={isSubmitting || isUploading}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading}
                sx={{
                  background:
                    "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                  },
                }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ mr: 1, color: "white" }}
                    />
                    Đang {editMode ? "cập nhật" : "thêm"}...
                  </>
                ) : (
                  editMode ? "Cập nhật bằng cấp" : "Thêm bằng cấp"
                )}
              </Button>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddDegreeDialog;
