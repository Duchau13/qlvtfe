import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
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
  VStack,
  Heading,
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React, { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import axiosInstance from "api/axios";

export default function Warehouses() {
  const brandColor = useColorModeValue("teal.500", "teal.200");
  const boxBg = useColorModeValue("gray.100", "gray.700");
  const tableBg = useColorModeValue("white", "gray.800");
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbType, setDbType] = useState("HCM");
  const toast = useToast();

  // Create modal state
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [createForm, setCreateForm] = useState({
    branchId: "HN",
    userAction: "a",
    name: "",
    address: "",
  });

  // Update modal state
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const [updateForm, setUpdateForm] = useState({ warehouseId: null, name: "", address: "" });

  // Delete confirmation modal state
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteWarehouseId, setDeleteWarehouseId] = useState(null);

  // Get accessToken from localStorage
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    // Fetch warehouses from API
    const fetchWarehouses = async () => {
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
        const response = await axiosInstance.get(`/v1/warehouses/?dbType=${dbType}`);
        console.log("API Response:", response.data); // Debug the response

        // Ensure response.data.data is an array, otherwise set to empty array
        const warehouseData = Array.isArray(response.data.data) ? response.data.data : [];
        setWarehouses(warehouseData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kho:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        toast({
          title: "Lỗi khi lấy danh sách kho",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setWarehouses([]);
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, [dbType, accessToken, toast]);

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

    try {
      const response = await axiosInstance.post("/v1/warehouses/", createForm);
      setWarehouses([...warehouses, response.data.data]);
      toast({
        title: "Đã tạo kho",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCreateForm({ branchId: "HN", userAction: "a", name: "", address: "" });
      onCreateClose();
    } catch (error) {
      console.error("Lỗi khi tạo kho:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi tạo kho",
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

    try {
      await axiosInstance.put(`/v1/warehouses/${updateForm.warehouseId}`, {
        name: updateForm.name,
        address: updateForm.address,
      });
      setWarehouses(
        warehouses.map((warehouse) =>
          warehouse.warehouseId === updateForm.warehouseId
            ? { ...warehouse, name: updateForm.name, address: updateForm.address }
            : warehouse
        )
      );
      toast({
        title: "Đã cập nhật kho",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setUpdateForm({ warehouseId: null, name: "", address: "" });
      onUpdateClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật kho:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi cập nhật kho",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Delete
  const handleDelete = async () => {
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

    try {
      await axiosInstance.delete(`/v1/warehouses/${deleteWarehouseId}`);
      setWarehouses(warehouses.filter((warehouse) => warehouse.warehouseId !== deleteWarehouseId));
      toast({
        title: "Đã xóa kho",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
    } catch (error) {
      console.error("Lỗi khi xóa kho:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi xóa kho",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open update modal with pre-filled data
  const openUpdateModal = (warehouse) => {
    setUpdateForm({
      warehouseId: warehouse.warehouseId,
      name: warehouse.name,
      address: warehouse.address,
    });
    onUpdateOpen();
  };

  return (
    <Box pt={{ base: "120px", md: "60px", xl: "60px" }} px="20px">
      <VStack spacing="20px" align="stretch">
        <Flex justify="space-between" align="center" mb="4">
          <Heading size="lg" color={brandColor}>Quản lý kho hàng</Heading>
          <FormControl maxW="200px">
            <FormLabel>Chọn chi nhánh</FormLabel>
            <Select
              value={dbType}
              onChange={(e) => setDbType(e.target.value)}
              bg={boxBg}
              borderColor={brandColor}
            >
              <option value="HCM">HCM</option>
              <option value="HN">HN</option>
            </Select>
          </FormControl>
        </Flex>

        <Card bg={tableBg} borderRadius="lg" boxShadow="lg">
          <Flex justify="flex-end" p="4">
            <Button
              leftIcon={<MdAdd />}
              colorScheme="teal"
              variant="solid"
              onClick={onCreateOpen}
            >
              Tạo kho mới
            </Button>
          </Flex>

          <Box p="4" overflowX="auto">
            <Table variant="striped" colorScheme="teal">
              <Thead bg={brandColor}>
                <Tr>
                  <Th color="white">ID Kho</Th>
                  <Th color="white">Tên kho</Th>
                  <Th color="white">Địa chỉ</Th>
                  <Th color="white">Chi nhánh</Th>
                  <Th color="white">Thời gian tạo</Th>
                  <Th color="white">Thời gian cập nhật</Th>
                  <Th color="white">Hành động</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center">
                      Đang tải...
                    </Td>
                  </Tr>
                ) : warehouses.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center">
                      Không tìm thấy kho
                    </Td>
                  </Tr>
                ) : (
                  warehouses.map((warehouse) => (
                    <Tr key={warehouse.warehouseId} _hover={{ bg: boxBg }}>
                      <Td>{warehouse.warehouseId}</Td>
                      <Td>{warehouse.name}</Td>
                      <Td>{warehouse.address}</Td>
                      <Td>{warehouse.branchId}</Td>
                      <Td>{new Date(warehouse.createdTime).toLocaleString()}</Td>
                      <Td>{new Date(warehouse.updatedTime).toLocaleString()}</Td>
                      <Td>
                        <Flex gap="2">
                          <Button
                            size="sm"
                            colorScheme="blue"
                            leftIcon={<MdEdit />}
                            onClick={() => openUpdateModal(warehouse)}
                          >
                            Cập nhật
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            leftIcon={<MdDelete />}
                            onClick={() => {
                              setDeleteWarehouseId(warehouse.warehouseId);
                              onDeleteOpen();
                            }}
                          >
                            Xóa
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Card>
      </VStack>

      {/* Create Warehouse Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tạo kho mới</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl>
                <FormLabel>ID Chi nhánh</FormLabel>
                <Input
                  value={createForm.branchId}
                  onChange={(e) => setCreateForm({ ...createForm, branchId: e.target.value })}
                  placeholder="Nhập ID chi nhánh"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tên kho</FormLabel>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Nhập tên kho"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Địa chỉ</FormLabel>
                <Input
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                />
              </FormControl>
              <FormControl>
                <FormLabel>User Action</FormLabel>
                <Input
                  value={createForm.userAction}
                  onChange={(e) => setCreateForm({ ...createForm, userAction: e.target.value })}
                  placeholder="Nhập user action"
                />
              </FormControl>
            </VStack>
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

      {/* Update Warehouse Modal */}
      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cập nhật kho</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl>
                <FormLabel>Tên kho</FormLabel>
                <Input
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                  placeholder="Nhập tên kho"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Địa chỉ</FormLabel>
                <Input
                  value={updateForm.address}
                  onChange={(e) => setUpdateForm({ ...updateForm, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpdate}>
              Cập nhật
            </Button>
            <Button variant="ghost" onClick={onUpdateClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Xác nhận xóa</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Bạn có chắc chắn muốn xóa kho này?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDelete}>
              Xóa
            </Button>
            <Button variant="ghost" onClick={onDeleteClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}