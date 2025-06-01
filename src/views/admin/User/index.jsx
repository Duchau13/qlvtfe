import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React, { useState, useEffect } from "react";
import { MdAdd, MdEdit } from "react-icons/md";
import axiosInstance from "api/axios";

export default function Accounts() {
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const tableBg = useColorModeValue("white", "gray.800");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Create modal state
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [createForm, setCreateForm] = useState({
    branchId: "HN",
    role: 2,
    password: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    dob: "",
    dbType: "HN",
  });

  // Update modal state
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const [updateForm, setUpdateForm] = useState({
    userId: "",
    branchId: "HN",
    role: 2,
    password: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    dob: "",
    dbType: "HN",
  });

  // Get accessToken from localStorage
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      if (!accessToken) {
        toast({
          title: "Lỗi xác thực",
          description: "Không tìm thấy access token. Vui lòng đăng nhập.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get("/v1/users");
        console.log("API Response:", response.data);
        const userData = Array.isArray(response.data.data) ? response.data.data : [];
        setUsers(userData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi gọi API:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        toast({
          title: "Lỗi khi lấy danh sách tài khoản",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setUsers([]);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [accessToken, toast]);

  // Handle Create
  const handleCreate = async () => {
    if (!accessToken) {
      toast({
        title: "Lỗi xác thực",
        description: "Không tìm thấy access token. Vui lòng đăng nhập.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!createForm.name || !createForm.email || !createForm.password) {
      toast({
        title: "Lỗi nhập liệu",
        description: "Vui lòng điền đầy đủ tên, email và mật khẩu.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/v1/users/",
        {
          branchId: createForm.branchId,
          role: createForm.role,
          password: createForm.password,
          name: createForm.name,
          address: createForm.address,
          phone: createForm.phone,
          email: createForm.email,
          dob: createForm.dob,
          dbType: createForm.dbType,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUsers([...users, response.data.data]);
      toast({
        title: "Đã tạo tài khoản",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCreateForm({
        branchId: "HN",
        role: 2,
        password: "",
        name: "",
        address: "",
        phone: "",
        email: "",
        dob: "",
        dbType: "HN",
      });
      onCreateClose();
    } catch (error) {
      console.error("Lỗi khi tạo tài khoản:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi tạo tài khoản",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Update
  const handleUpdate = async () => {
    if (!accessToken) {
      toast({
        title: "Lỗi xác thực",
        description: "Không tìm thấy access token. Vui lòng đăng nhập.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (!updateForm.name || !updateForm.email) {
      toast({
        title: "Lỗi nhập liệu",
        description: "Vui lòng điền đầy đủ tên và email.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axiosInstance.put(
        "/user/update",
        {
          branchId: updateForm.branchId,
          role: updateForm.role,
          password: updateForm.password,
          name: updateForm.name,
          address: updateForm.address,
          phone: updateForm.phone,
          email: updateForm.email,
          dob: updateForm.dob,
          dbType: updateForm.dbType,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUsers(
        users.map((user) =>
          user.userId === updateForm.userId ? { ...user, ...response.data.data } : user
        )
      );
      toast({
        title: "Đã cập nhật tài khoản",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setUpdateForm({
        userId: "",
        branchId: "HN",
        role: 2,
        password: "",
        name: "",
        address: "",
        phone: "",
        email: "",
        dob: "",
        dbType: "HN",
      });
      onUpdateClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật tài khoản:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi cập nhật tài khoản",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open update modal with pre-filled data
  const openUpdateModal = (user) => {
    setUpdateForm({
      userId: user.userId,
      branchId: user.branchId,
      role: user.role,
      password: "",
      name: user.name,
      address: user.address,
      phone: user.phone,
      email: user.email,
      dob: user.dob.split("T")[0],
      dbType: user.branchId,
    });
    onUpdateOpen();
  };

  // Map role ID to display name
  const getRoleName = (role) => {
    switch (role) {
      case 2:
        return "Staff";
      case 3:
        return "Admin";
      default:
        return "Unknown";
    }
  };

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap="20px" mb="20px">
        <Card>
          {/* Create Button */}
          <Flex justify="flex-end" mb="4">
            <Button
              leftIcon={<MdAdd />}
              colorScheme="teal"
              onClick={onCreateOpen}
            >
              Tạo tài khoản
            </Button>
          </Flex>

          {/* Users Table */}
          <Box bg={tableBg} borderRadius="md" boxShadow="md" p="4">
            <Table variant="simple" colorScheme="teal">
              <Thead bg={brandColor} color="white">
                <Tr>
                  <Th color="white">User ID</Th>
                  <Th color="white">ID Chi nhánh</Th>
                  <Th color="white">Tên</Th>
                  <Th color="white">Email</Th>
                  <Th color="white">Số điện thoại</Th>
                  <Th color="white">Địa chỉ</Th>
                  <Th color="white">Ngày sinh</Th>
                  <Th color="white">Vai trò</Th>
                  <Th color="white">Hành động</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={9} textAlign="center">
                      Đang tải...
                    </Td>
                  </Tr>
                ) : users.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} textAlign="center">
                      Không tìm thấy tài khoản
                    </Td>
                  </Tr>
                ) : (
                  users.map((user) => (
                    <Tr key={user.email} _hover={{ bg: boxBg }}>
                      <Td>{user.userId}</Td>
                      <Td>{user.branchId}</Td>
                      <Td>{user.name}</Td>
                      <Td>{user.email}</Td>
                      <Td>{user.phone}</Td>
                      <Td>{user.address}</Td>
                      <Td>{new Date(user.dob).toLocaleDateString()}</Td>
                      <Td>{getRoleName(user.role)}</Td>
                      <Td>
                        <IconButton
                          icon={<MdEdit />}
                          colorScheme="teal"
                          size="sm"
                          onClick={() => openUpdateModal(user)}
                          aria-label="Chỉnh sửa tài khoản"
                        />
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Card>
      </SimpleGrid>

      {/* Create User Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tạo tài khoản mới</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="4">
              <FormLabel>ID Chi nhánh</FormLabel>
              <Input
                value={createForm.branchId}
                onChange={(e) => setCreateForm({ ...createForm, branchId: e.target.value })}
                placeholder="Nhập ID chi nhánh"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Tên</FormLabel>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Nhập tên"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="Nhập email"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Mật khẩu</FormLabel>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Nhập mật khẩu"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Số điện thoại</FormLabel>
              <Input
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Địa chỉ</FormLabel>
              <Input
                value={createForm.address}
                onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                placeholder="Nhập địa chỉ"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Ngày sinh</FormLabel>
              <Input
                type="date"
                value={createForm.dob}
                onChange={(e) => setCreateForm({ ...createForm, dob: e.target.value })}
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Vai trò</FormLabel>
              <Select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: parseInt(e.target.value) })}
              >
                <option value={2}>Staff</option>
                <option value={3}>Admin</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Loại cơ sở dữ liệu</FormLabel>
              <Input
                value={createForm.dbType}
                onChange={(e) => setCreateForm({ ...createForm, dbType: e.target.value })}
                placeholder="Nhập loại cơ sở dữ liệu"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleCreate}>
              Tạo
            </Button>
            <Button variant="ghost" onClick={onCreateClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Update User Modal */}
      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cập nhật tài khoản</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="4">
              <FormLabel>ID Chi nhánh</FormLabel>
              <Input
                value={updateForm.branchId}
                onChange={(e) => setUpdateForm({ ...updateForm, branchId: e.target.value })}
                placeholder="Nhập ID chi nhánh"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Tên</FormLabel>
              <Input
                value={updateForm.name}
                onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                placeholder="Nhập tên"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={updateForm.email}
                onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                placeholder="Nhập email"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Mật khẩu (để trống nếu không thay đổi)</FormLabel>
              <Input
                type="password"
                value={updateForm.password}
                onChange={(e) => setUpdateForm({ ...updateForm, password: e.target.value })}
                placeholder="Nhập mật khẩu mới"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Số điện thoại</FormLabel>
              <Input
                value={updateForm.phone}
                onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Địa chỉ</FormLabel>
              <Input
                value={updateForm.address}
                onChange={(e) => setUpdateForm({ ...updateForm, address: e.target.value })}
                placeholder="Nhập địa chỉ"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Ngày sinh</FormLabel>
              <Input
                type="date"
                value={updateForm.dob}
                onChange={(e) => setUpdateForm({ ...updateForm, dob: e.target.value })}
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Vai trò</FormLabel>
              <Select
                value={updateForm.role}
                onChange={(e) => setUpdateForm({ ...updateForm, role: parseInt(e.target.value) })}
              >
                <option value={2}>Staff</option>
                <option value={3}>Admin</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Loại cơ sở dữ liệu</FormLabel>
              <Input
                value={updateForm.dbType}
                onChange={(e) => setUpdateForm({ ...updateForm, dbType: e.target.value })}
                placeholder="Nhập loại cơ sở dữ liệu"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleUpdate}>
              Cập nhật
            </Button>
            <Button variant="ghost" onClick={onUpdateClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}