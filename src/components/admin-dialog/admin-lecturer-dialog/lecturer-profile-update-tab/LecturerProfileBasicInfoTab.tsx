import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Typography,
  Autocomplete,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setLecturers } from "../../../../redux/slice/LecturerSlice";
import {
  formatDateToVietnamTime,
  getAcademicRank,
  getStatus,
  getStatusColor,
} from "../../../../utils/ChangeText";
import { API } from "../../../../utils/Fetch";
import { validateLecturerInfo } from "../../../../utils/Validate";
import { GeneralConfirmDialog } from "../../../general-dialog";
import ApproveLecturerUpdateDialog from "../ApproveLecturerUpdateDialog";
import { setLecturerProfileUpdate } from "../../../../redux/slice/LecturerProfileUpdateSlice";
import {
  specializationAutoComplete,
  jobFieldAutoComplete,
} from "../../../../utils/AutoComplete";

interface LecturerProfileBasicInfoTabProps {
  onRefreshData: () => Promise<void>;
  canUpdate?: boolean;
  canApproveLecturer?: boolean;
  canDeleteLecturer?: boolean;
}

const LecturerProfileBasicInfoTab: React.FC<
  LecturerProfileBasicInfoTabProps
> = ({ onRefreshData, canUpdate = true, canApproveLecturer = true }) => {
  const dispatch = useDispatch();
  // Get lecturer data from Redux
  const lecturerProfileUpdate = useSelector(
    (state: any) => state.lecturerProfileUpdate,
  );
  const lecturerData = lecturerProfileUpdate; // Để tương thích với giao diện cũ

  // Lấy trực tiếp object giảng viên từ lecturerData
  const lecturer = lecturerData?.lecturer;
  // Safe avatar url
  const avatarUrl = lecturer?.avatarUrl || undefined;

  // Basic info states
  const [fullName, setFullName] = useState<string>("");
  const [citizenId, setCitizenId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [academicRank, setAcademicRank] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [jobField, setJobField] = useState<string>("");
  const [experienceYears, setExperienceYears] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [bio, setBio] = useState<string>("");

  // Dialog states
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Initialize states from lecturer data
  useEffect(() => {
    console.log("Lecturer data loaded:", lecturerData);
    if (lecturer) {
      setFullName(lecturer.fullName || "");
      setCitizenId(lecturer.citizenId || "");
      setEmail(lecturer.email || "");
      setAcademicRank(lecturer.academicRank || "");
      setSpecialization(lecturer.specialization || "");
      setJobField(lecturer.jobField || "");
      setExperienceYears(String(lecturer.experienceYears || 0));
      setPhoneNumber(lecturer.phoneNumber || "");
      setDateOfBirth(lecturer.dateOfBirth || "");
      setGender(lecturer.gender ? "true" : "false");
      setAddress(lecturer.address || "");
      setBio(lecturer.bio || "");
    }
  }, [lecturer]);

  const handleSave = () => {
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);

    const formData = {
      fullName,
      citizenId,
      phoneNumber,
      dateOfBirth,
      gender,
      academicRank,
      specialization,
      jobField,
      experienceYears,
      address,
      bio,
    };

    const error = validateLecturerInfo(formData);
    if (error.success === false) {
      toast.error(error.error);
      return;
    }

    try {
      const updateLecturerRequest = {
        ...lecturer,
        fullName: fullName.trim(),
        citizenId: citizenId.trim(),
        email: email.trim(),
        academicRank,
        specialization: specialization.trim(),
        jobField: jobField.trim(),
        experienceYears: Number(experienceYears),
        phoneNumber: phoneNumber.trim(),
        dateOfBirth,
        gender: gender === "true",
        address: address.trim(),
        bio: bio.trim(),
      };

      const response = await API.admin.updateLecturer(updateLecturerRequest);
      if (response.data.success) {
        toast.success("Cập nhật thông tin giảng viên thành công!");
        await onRefreshData(); // Refresh data
        const res = await API.admin.getAllLecturers();
        dispatch(setLecturers(res.data.data));
      } else {
        toast.error(
          response.data.error || "Có lỗi xảy ra khi cập nhật thông tin!",
        );
      }
      const r = await API.admin.getLecturerAllProfile({
        id: lecturer.id,
      });
      if (r.data.success) {
        dispatch(setLecturerProfileUpdate(r.data.data));
      }
    } catch (error: any) {
      console.error("Error updating lecturer:", error);
      if (error.response?.data?.message?.includes("đã tồn tại")) {
        toast.error("Số CCCD/CMND đã được đăng ký trước đó.");
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật thông tin!");
      }
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Profile Header Card */}
      <Card
        elevation={4}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              src={avatarUrl}
              alt={lecturer?.fullName || ""}
              sx={{
                width: 80,
                height: 80,
                border: "3px solid rgba(255,255,255,0.9)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                background: "linear-gradient(45deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <PersonIcon sx={{ fontSize: 40, color: "white" }} />
            </Avatar>

            <Box flex={1}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  mb: 1,
                }}
              >
                {lecturer?.fullName || "Chưa có tên"}
              </Typography>

              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Chip
                  label={getAcademicRank(lecturer?.academicRank)}
                  sx={{
                    background: "linear-gradient(45deg, #FFD700, #FFA500)",
                    color: "#1a1a1a",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    boxShadow: "0 2px 8px rgba(255,215,0,0.3)",
                  }}
                  size="small"
                />
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 500,
                  textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              >
                📧 {lecturer?.email || "Chưa có email"}
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                Trạng thái
              </Typography>
              <Chip
                label={getStatus(lecturer?.status)}
                color={getStatusColor(lecturer?.status) as any}
                variant="filled"
                size="medium"
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                  minWidth: 90,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Show lecturer update request if exists */}
      {lecturerData?.lecturerUpdate && (
        <Card
          elevation={2}
          sx={{
            borderLeft: 4,
            borderColor: "warning.main",
            backgroundColor: "warning.50",
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: "warning.main", width: 32, height: 32 }}>
                  <EditIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="warning.dark"
                  >
                    Có yêu cầu cập nhật thông tin cá nhân
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cập nhật lần cuối:{" "}
                    {formatDateToVietnamTime(
                      lecturerData.lecturerUpdate.updatedAt,
                    )}
                  </Typography>
                </Box>
              </Box>
              {canApproveLecturer && (
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => setShowApprovalDialog(true)}
                  sx={{ fontWeight: 600 }}
                >
                  Xem chi tiết
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Form Cards Grid */}
      <Box display="flex" flexDirection={{ xs: "column", lg: "row" }} gap={3}>
        {/* Personal Information Card */}
        <Box flex={1}>
          <Card elevation={1} sx={{ height: "100%" }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <PersonIcon />
                </Avatar>
              }
              title="Thông tin cá nhân"
            />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={2}>
                  <TextField
                    label="Họ và tên"
                    value={fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFullName(e.target.value)
                    }
                    sx={{ flex: "1 1 auto" }}
                    variant="outlined"
                    disabled={!canUpdate}
                  />
                  <TextField
                    label="CCCD/CMND"
                    value={citizenId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCitizenId(e.target.value)
                    }
                    sx={{ flex: "0 0 150px" }}
                    variant="outlined"
                    disabled={!canUpdate}
                  />
                </Box>

                <TextField
                  label="Số điện thoại"
                  value={phoneNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPhoneNumber(e.target.value)
                  }
                  fullWidth
                  variant="outlined"
                  disabled={!canUpdate}
                />

                <Box display="flex" gap={2}>
                  <TextField
                    label="Ngày sinh"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDateOfBirth(e.target.value)
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ flex: "0 0 150px" }}
                    variant="outlined"
                    disabled={!canUpdate}
                  />
                  <FormControl sx={{ width: "100%" }}>
                    <Typography variant="body2" gutterBottom>
                      Giới tính
                    </Typography>
                    <RadioGroup
                      row
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <FormControlLabel
                        value="true"
                        control={<Radio size="small" disabled={!canUpdate} />}
                        label="Nam"
                        disabled={!canUpdate}
                      />
                      <FormControlLabel
                        value="false"
                        control={<Radio size="small" disabled={!canUpdate} />}
                        label="Nữ"
                        disabled={!canUpdate}
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                <TextField
                  label="Địa chỉ"
                  value={address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddress(e.target.value)
                  }
                  fullWidth
                  multiline
                  rows={2}
                  variant="outlined"
                  disabled={!canUpdate}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Academic Information Card */}
        <Box flex={1}>
          <Card elevation={1} sx={{ height: "100%" }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <WorkIcon />
                </Avatar>
              }
              title="Thông tin học thuật"
            />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={2}>
                  <FormControl variant="outlined" sx={{ flex: "0 0 120px" }}>
                    <InputLabel>Học vị</InputLabel>
                    <Select
                      value={academicRank}
                      onChange={(e) => setAcademicRank(e.target.value)}
                      label="Học vị"
                      disabled={!canUpdate}
                    >
                      <MenuItem value="">
                        <em>Chọn học vị</em>
                      </MenuItem>

                      <MenuItem value="CN">Cử nhân</MenuItem>
                      <MenuItem value="KS">Kỹ sư</MenuItem>
                      <MenuItem value="THS">Thạc sĩ</MenuItem>
                      <MenuItem value="TS">Tiến sĩ</MenuItem>
                      <MenuItem value="PGS">Phó giáo sư</MenuItem>
                      <MenuItem value="GS">Giáo sư</MenuItem>
                    </Select>
                  </FormControl>
                  <Autocomplete
                    options={specializationAutoComplete}
                    value={specialization}
                    onChange={(_, newValue) => {
                      setSpecialization(newValue || "");
                    }}
                    freeSolo
                    disabled={!canUpdate}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Chuyên ngành"
                        variant="outlined"
                        disabled={!canUpdate}
                      />
                    )}
                    sx={{ flex: "1 1 auto" }}
                  />
                </Box>

                <Box display="flex" gap={2}>
                  <Autocomplete
                    options={jobFieldAutoComplete}
                    value={jobField}
                    onChange={(_, newValue) => {
                      setJobField(newValue || "");
                    }}
                    freeSolo
                    disabled={!canUpdate}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Lĩnh vực"
                        variant="outlined"
                        disabled={!canUpdate}
                      />
                    )}
                    sx={{ flex: "1 1 auto" }}
                  />
                  <TextField
                    label="Năm KN"
                    value={experienceYears}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setExperienceYears(e.target.value)
                    }
                    sx={{ maxWidth: 120, flex: "0 0 auto" }}
                    type="number"
                    variant="outlined"
                    disabled={!canUpdate}
                  />
                </Box>

                <TextField
                  label="Tiểu sử"
                  value={bio}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBio(e.target.value)
                  }
                  fullWidth
                  multiline
                  rows={5}
                  variant="outlined"
                  disabled={!canUpdate}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Created/Updated At Box */}
      <Box
        mt={2}
        display="flex"
        flexDirection="column"
        alignItems="flex-end"
        gap={1}
      >
        <Typography variant="body2" color="text.secondary">
          Được tạo lúc:{" "}
          {lecturer?.createdAt
            ? new Date(lecturer.createdAt).toLocaleString("vi-VN")
            : "Chưa cập nhật"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cập nhật lần cuối:{" "}
          {lecturer?.updatedAt
            ? new Date(lecturer?.updatedAt).toLocaleString("vi-VN")
            : "Chưa cập nhật"}
        </Typography>
      </Box>

      {/* Save Button */}
      {canUpdate && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              },
            }}
          >
            Lưu
          </Button>
        </Box>
      )}

      {/* Approve Lecturer Update Dialog */}
      {lecturerData?.lecturerUpdate && (
        <ApproveLecturerUpdateDialog
          open={showApprovalDialog}
          onClose={() => setShowApprovalDialog(false)}
          lecturer={lecturer}
          lecturerUpdate={lecturerData.lecturerUpdate}
          onDataReloaded={onRefreshData}
        />
      )}

      {/* Confirm Dialog */}
      <GeneralConfirmDialog
        open={confirmOpen}
        title="Xác nhận cập nhật"
        message="Bạn có chắc chắn muốn cập nhật thông tin giảng viên này không?"
        onConfirm={handleConfirm}
        onClose={handleCancel}
      />
    </Box>
  );
};

export default LecturerProfileBasicInfoTab;
