import { Close } from "@mui/icons-material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import ScienceIcon from "@mui/icons-material/Science";
import WorkIcon from "@mui/icons-material/Work";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { setLecturerProfileUpdate } from "../../../redux/slice/LecturerProfileUpdateSlice";
import type { Lecturer } from "../../../types/Lecturer";
import { API } from "../../../utils/Fetch";
import {
  LecturerProfileBasicInfoTab,
  LecturerProfileCertificationsTab,
  LecturerProfileCoursesTab,
  LecturerProfileDegreesTab,
  LecturerProfileResearchProjectsTab,
} from "./lecturer-profile-update-tab";

interface LecturerProfileUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  lecturer?: Lecturer;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lecturer-tabpanel-${index}`}
      aria-labelledby={`lecturer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const LecturerProfileUpdateDialog = ({
  open,
  onClose,
  lecturer,
}: LecturerProfileUpdateDialogProps) => {
  if (!open || !lecturer) return null;
  const dispatch = useDispatch();
  const userProfile = useSelector((state: any) => state.userProfile);

  // Permission checks
  const isAdmin = userProfile?.role === "ADMIN";
  const canCreateLecturer = isAdmin || userProfile?.permissions?.includes("LECTURER_CREATE") || false;
  const canUpdateLecturer = isAdmin || userProfile?.permissions?.includes("LECTURER_UPDATE") || false;
  const canApproveLecturer = isAdmin || userProfile?.permissions?.includes("LECTURER_APPROVE") || false;
  const canDeleteLecturer = isAdmin || userProfile?.permissions?.includes("LECTURER_DELETE") || false;

  // Debug permissions
  console.log("🔍 Debug Permissions:", {
    userProfile,
    role: userProfile?.role,
    isAdmin,
    permissions: userProfile?.permissions,
    canCreateLecturer,
    canUpdateLecturer,
    canApproveLecturer,
    canDeleteLecturer
  });

  // Tab state
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch full lecturer data when dialog opens
  useEffect(() => {
    if (open && lecturer?.id) {
      fetchLecturerData();
      // Also refresh user profile to get latest permissions
      refreshUserProfile();
    }
  }, [open, lecturer?.id]);

  const refreshUserProfile = async () => {
    try {
      // TODO: Add API call to refresh user profile if needed
      // const response = await API.auth.getCurrentUser();
      // if (response.data.success) {
      //   dispatch(setProfile(response.data.data));
      // }
      console.log("🔄 Would refresh user profile here");
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  const fetchLecturerData = async () => {
    try {
      setLoading(true);
      const response = await API.admin.getLecturerAllProfile({
        id: lecturer.id,
      });
      if (response.data.success) {
        dispatch(setLecturerProfileUpdate(response.data.data));
      }
    } catch (error) {
      console.error("Error fetching lecturer data:", error);
      toast.error("Không thể tải dữ liệu giảng viên");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handler functions for tab operations
  const handleRefreshData = async () => {
    await fetchLecturerData();
  };

  // Placeholder handlers for future implementation
  const handleAddDegree = () => {
    console.log("Add degree");
  };

  const handleEditDegree = (degree: any) => {
    console.log("Edit degree:", degree);
  };

  const handleDeleteDegree = (degree: any) => {
    console.log("Delete degree:", degree);
  };

  const handleAddCertification = () => {
    console.log("Add certification");
  };

  const handleEditCertification = (certification: any) => {
    console.log("Edit certification:", certification);
  };

  const handleDeleteCertification = (certification: any) => {
    console.log("Delete certification:", certification);
  };

  const handleAddOwnedCourse = () => {
    console.log("Add owned course");
    // TODO: Implement add owned course dialog
  };

  const handleAddAttendedCourse = () => {
    console.log("Add attended course");
    // TODO: Implement add attended course dialog
  };

  const handleEditOwnedCourse = (course: any) => {
    console.log("Edit owned course:", course);
    // TODO: Implement edit owned course dialog
  };

  const handleEditAttendedCourse = (course: any) => {
    console.log("Edit attended course:", course);
    // TODO: Implement edit attended course dialog
  };

  const handleDeleteOwnedCourse = async (course: any) => {
    console.log("Delete owned course:", course);
    try {
      // TODO: Implement API call to delete owned course
      // const response = await API.admin.deleteOwnedCourse(course.id);
      // if (response.data.success) {
      //   await fetchLecturerData();
      //   toast.success("Xóa khóa học sở hữu thành công");
      // }
      toast.info("Chức năng xóa khóa học sở hữu sẽ được triển khai sau");
    } catch (error) {
      console.error("Error deleting owned course:", error);
      toast.error("Có lỗi xảy ra khi xóa khóa học sở hữu");
    }
  };

  const handleDeleteAttendedCourse = async (course: any) => {
    console.log("Delete attended course:", course);
    try {
      // TODO: Implement API call to delete attended course
      // const response = await API.admin.deleteAttendedCourse(course.id);
      // if (response.data.success) {
      //   await fetchLecturerData();
      //   toast.success("Xóa khóa học đã tham gia thành công");
      // }
      toast.info("Chức năng xóa khóa học đã tham gia sẽ được triển khai sau");
    } catch (error) {
      console.error("Error deleting attended course:", error);
      toast.error("Có lỗi xảy ra khi xóa khóa học đã tham gia");
    }
  };

  const handleAddResearchProject = () => {
    console.log("Add research project");
  };

  const handleEditResearchProject = (project: any) => {
    console.log("Edit research project:", project);
  };

  const handleDeleteResearchProject = (project: any) => {
    console.log("Delete research project:", project);
  };

  const handleApproveResearchProjectUpdate = (projectData: any) => {
    console.log("Approve research project update:", projectData);
  };

  const handleRejectResearchProjectUpdate = (projectData: any) => {
    console.log("Reject research project update:", projectData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          height: "90vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Quản lý hồ sơ giảng viên
          </Typography>
          <Typography variant="body2">ID: {lecturer?.id}</Typography>
        </Box>

        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ minHeight: 48 }}
        >
          <Tab
            icon={<PersonIcon />}
            label="Thông tin cơ bản"
            id="lecturer-tab-0"
            aria-controls="lecturer-tabpanel-0"
          />
          <Tab
            icon={<SchoolIcon />}
            label="Bằng cấp"
            id="lecturer-tab-1"
            aria-controls="lecturer-tabpanel-1"
          />
          <Tab
            icon={<WorkIcon />}
            label="Chứng chỉ"
            id="lecturer-tab-2"
            aria-controls="lecturer-tabpanel-2"
          />
          <Tab
            icon={<MenuBookIcon />}
            label="Khóa học"
            id="lecturer-tab-3"
            aria-controls="lecturer-tabpanel-3"
          />
          <Tab
            icon={<ScienceIcon />}
            label="Nghiên cứu"
            id="lecturer-tab-4"
            aria-controls="lecturer-tabpanel-4"
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0, height: "70vh", overflow: "auto" }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography>Đang tải dữ liệu...</Typography>
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              <LecturerProfileBasicInfoTab 
                onRefreshData={handleRefreshData}
                canUpdate={canUpdateLecturer}
                canApproveLecturer={canApproveLecturer}
                canDeleteLecturer={canDeleteLecturer}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <LecturerProfileDegreesTab
                onAddDegree={canCreateLecturer ? handleAddDegree : undefined}
                onEditDegree={handleEditDegree}
                onDeleteDegree={handleDeleteDegree}
                canCreateLecturer={canCreateLecturer}
                canUpdateLecturer={canUpdateLecturer}
                canApproveLecturer={canApproveLecturer}
                canDeleteLecturer={canDeleteLecturer}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              <LecturerProfileCertificationsTab
                onAddCertification={canCreateLecturer ? handleAddCertification : undefined}
                onEditCertification={handleEditCertification}
                onDeleteCertification={handleDeleteCertification}
                canCreateLecturer={canCreateLecturer}
                canUpdateLecturer={canUpdateLecturer}
                canApproveLecturer={canApproveLecturer}
                canDeleteLecturer={canDeleteLecturer}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <LecturerProfileCoursesTab
                onAddOwnedCourse={canCreateLecturer ? handleAddOwnedCourse : undefined}
                onAddAttendedCourse={canCreateLecturer ? handleAddAttendedCourse : undefined}
                onEditOwnedCourse={handleEditOwnedCourse}
                onEditAttendedCourse={handleEditAttendedCourse}
                onDeleteOwnedCourse={handleDeleteOwnedCourse}
                onDeleteAttendedCourse={handleDeleteAttendedCourse}
                canCreateLecturer={canCreateLecturer}
                canApproveLecturer={canApproveLecturer}
                canDeleteLecturer={canDeleteLecturer}
                canUpdateLecturer={canUpdateLecturer}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <LecturerProfileResearchProjectsTab
                onAddResearchProject={canCreateLecturer ? handleAddResearchProject : undefined}
                onEditResearchProject={handleEditResearchProject}
                onDeleteResearchProject={handleDeleteResearchProject}
                onApproveResearchProjectUpdate={
                  handleApproveResearchProjectUpdate
                }
                onRejectResearchProjectUpdate={
                  handleRejectResearchProjectUpdate
                }
                canCreateLecturer={canCreateLecturer}
                canApproveLecturer={canApproveLecturer}
                canDeleteLecturer={canDeleteLecturer}
                canUpdateLecturer={canUpdateLecturer}
              />
            </TabPanel>
          </>
        )}
      </DialogContent>

      {/* <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
        >
          Đóng
        </Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default LecturerProfileUpdateDialog;
