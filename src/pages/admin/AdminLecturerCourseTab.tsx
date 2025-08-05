import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DateRange from "@mui/icons-material/DateRange";

interface AdminLecturerCourseTabProps {
  filteredCourseList: any[];
  courseSearchTerm: string;
  setCourseSearchTerm: (value: string) => void;
  courseTypeFilter: string;
  setCourseTypeFilter: (value: string) => void;
  courseDateSort: string;
  setCourseDateSort: (value: string) => void;
}

const AdminLecturerCourseTab: React.FC<AdminLecturerCourseTabProps> = ({
  filteredCourseList,
  courseSearchTerm,
  setCourseSearchTerm,
  courseTypeFilter,
  setCourseTypeFilter,
  courseDateSort,
  setCourseDateSort,
}) => {
  const handleCourseItemClick = (item: any) => {
    console.log("View details for:", item);
    // TODO: Implement course item detail dialog
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                width: 56,
                height: 56,
              }}
            >
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: 700 }}
              >
                📚
              </Typography>
            </Avatar>
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#2c3e50", mb: 0.5 }}
              >
                Yêu cầu khóa đào tạo và hoạt động
              </Typography>
              <Typography variant="body2" sx={{ color: "#6c757d" }}>
                {courseSearchTerm || courseTypeFilter
                  ? `Đã lọc ${filteredCourseList?.length || 0} yêu cầu`
                  : `Tổng cộng ${filteredCourseList?.length || 0} yêu cầu khóa học và hoạt động`}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ minWidth: 250, flex: "0 0 auto" }}>
            <FormControl fullWidth size="small">
              <InputLabel>Loại</InputLabel>
              <Select
                value={courseTypeFilter}
                label="Loại"
                onChange={(e) => setCourseTypeFilter(e.target.value)}
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                }}
              >
                <MenuItem value="">
                  <em>Tất cả</em>
                </MenuItem>
                <MenuItem value="OC">Khóa đào tạo cung cấp</MenuItem>
                <MenuItem value="AC">Khóa đào tạo được học</MenuItem>
                <MenuItem value="RP">Nghiên cứu khoa học</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 180, flex: "0 0 auto" }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sắp xếp theo ngày</InputLabel>
              <Select
                value={courseDateSort}
                label="Sắp xếp theo ngày"
                onChange={(e) => setCourseDateSort(e.target.value)}
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                }}
              >
                <MenuItem value="oldest">Cũ nhất trước</MenuItem>
                <MenuItem value="newest">Mới nhất trước</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flex: "1 1 300px", minWidth: 300 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="🔍 Theo ID, tên giảng viên, tên khóa học..."
              value={courseSearchTerm}
              onChange={(e) => setCourseSearchTerm(e.target.value)}
              sx={{
                bgcolor: "white",
                borderRadius: 2,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "primary.main" }} />
                  </InputAdornment>
                ),
                endAdornment: courseSearchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setCourseSearchTerm("")}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        {/* Active Filters Display */}
        {(courseSearchTerm ||
          courseTypeFilter ||
          courseDateSort !== "oldest") && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "#6c757d", mr: 1 }}>
              Bộ lọc đang áp dụng:
            </Typography>

            {courseSearchTerm && (
              <Chip
                label={`Tìm kiếm: "${courseSearchTerm}"`}
                size="small"
                onDelete={() => setCourseSearchTerm("")}
                color="primary"
                variant="outlined"
              />
            )}

            {courseTypeFilter && (
              <Chip
                label={`Loại: ${
                  courseTypeFilter === "OC"
                    ? "Khóa đào tạo cung cấp"
                    : courseTypeFilter === "AC"
                      ? "Khóa đào tạo được học"
                      : "Nghiên cứu khoa học"
                }`}
                size="small"
                onDelete={() => setCourseTypeFilter("")}
                color="secondary"
                variant="outlined"
              />
            )}

            {courseDateSort !== "oldest" && (
              <Chip
                label={`Sắp xếp: ${courseDateSort === "newest" ? "Mới nhất trước" : "Cũ nhất trước"}`}
                size="small"
                onDelete={() => setCourseDateSort("oldest")}
                color="info"
                variant="outlined"
                icon={<DateRange />}
              />
            )}

            <Button
              size="small"
              onClick={() => {
                setCourseSearchTerm("");
                setCourseTypeFilter("");
                setCourseDateSort("oldest");
              }}
              sx={{ ml: 1, textTransform: "none" }}
            >
              Xóa tất cả
            </Button>
          </Box>
        )}
      </Paper>

      {filteredCourseList && filteredCourseList.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 3,
            "@media (min-width: 1200px)": {
              gridTemplateColumns: "repeat(4, 1fr)",
            },
            "@media (min-width: 900px) and (max-width: 1199px)": {
              gridTemplateColumns: "repeat(3, 1fr)",
            },
            "@media (min-width: 600px) and (max-width: 899px)": {
              gridTemplateColumns: "repeat(2, 1fr)",
            },
            "@media (max-width: 599px)": {
              gridTemplateColumns: "1fr",
            },
          }}
        >
          {filteredCourseList.map((item: any, index: number) => {
            const contentData =
              item.label === "Update" ? item.content?.original : item.content;

            return (
              <Card
                key={`course-${item.type}-${item.content?.id}-${item.label}-${index}`}
                sx={{
                  transition: "all 0.3s ease",
                  border: "2px solid",
                  borderColor:
                    item.label === "Create" ? "success.light" : "warning.light",
                  borderRadius: 3,
                  height: "fit-content",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    borderColor:
                      item.label === "Create" ? "success.main" : "warning.main",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <Avatar
                        src={item.lecturerInfo?.avatarUrl || ""}
                        sx={{
                          bgcolor:
                            item.label === "Create"
                              ? "success.main"
                              : "warning.main",
                          width: 50,
                          height: 50,
                          fontSize: "1.2rem",
                          fontWeight: 700,
                        }}
                      >
                        {item.lecturerInfo?.fullName?.charAt(0)}
                      </Avatar>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.lecturerInfo?.fullName}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                          <Chip
                            label={
                              item.type === "OC"
                                ? "Cung cấp"
                                : item.type === "AC"
                                  ? "Được học"
                                  : "Nghiên cứu"
                            }
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                          <Chip
                            label={item.label}
                            size="small"
                            color={
                              item.label === "Create" ? "success" : "warning"
                            }
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Tên
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {contentData?.title || contentData?.name}
                        </Typography>
                      </Box>

                      {contentData?.topic && (
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            Chuyên đề
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {contentData.topic}
                          </Typography>
                        </Box>
                      )}

                      {contentData?.researchArea && (
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            Lĩnh vực
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {contentData.researchArea}
                          </Typography>
                        </Box>
                      )}

                      {contentData?.courseType && (
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            Loại hình
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500 }}
                          >
                            {contentData.courseType === "FORMAL"
                              ? "Chính quy"
                              : contentData.courseType === "SPECIALIZED"
                                ? "Chuyên đề"
                                : contentData.courseType === "EXTRACURRICULAR"
                                  ? "Ngoại khóa"
                                  : "Khác"}
                          </Typography>
                        </Box>
                      )}

                      {contentData?.scale && (
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            Quy mô
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500 }}
                          >
                            {contentData.scale === "INSTITUTIONAL"
                              ? "Cấp đơn vị"
                              : contentData.scale === "NATIONAL"
                                ? "Cấp quốc gia"
                                : contentData.scale === "INTERNATIONAL"
                                  ? "Cấp quốc tế"
                                  : contentData.scale === "UNIVERSITY"
                                    ? "Cấp trường"
                                    : contentData.scale === "DEPARTMENTAL"
                                      ? "Cấp khoa/tỉnh"
                                      : contentData.scale === "MINISTERIAL"
                                        ? "Cấp bộ"
                                        : "Khác"}
                          </Typography>
                        </Box>
                      )}

                      <Button
                        variant="contained"
                        color={item.label === "Create" ? "success" : "warning"}
                        size="small"
                        fullWidth
                        sx={{
                          mt: 1,
                          py: 1,
                          fontWeight: 600,
                          textTransform: "none",
                          borderRadius: 2,
                          fontSize: "0.8rem",
                        }}
                        onClick={() => handleCourseItemClick(item)}
                      >
                        Xem chi tiết
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Không có yêu cầu nào
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hiện tại không có yêu cầu khóa đào tạo/hoạt động nào cần xử lý.
          </Typography>
        </Paper>
      )}
    </>
  );
};

export default AdminLecturerCourseTab;
