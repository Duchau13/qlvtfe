import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Grid,
  VStack,
  Heading,
  Text,
  Tag,
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
  Stack,
  IconButton,
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import axiosInstance from "api/axios";

export default function Customers() {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("teal.600", "teal.300");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Update modal state
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const [updateForm, setUpdateForm] = useState({
    customerId: null,
    name: "",
    address: "",
    phone: "",
    email: "",
    note: "",
  });

  // Delete modal state
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteCustomerId, setDeleteCustomerId] = useState(null);

  // Get branchId and accessToken from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const branchId = user.branchId || "HN";
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    // Fetch customers from API
    const fetchCustomers = async () => {
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
        const response = await axiosInstance.get(`/v1/customers/?dbType=${branchId}`);
        console.log("Customers API Response:", response.data);
        const customerData = Array.isArray(response.data.data) ? response.data.data : [];
        setCustomers(customerData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khách hàng:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        toast({
          title: "Lỗi khi lấy danh sách khách hàng",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setCustomers([]);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [branchId, accessToken, toast]);

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
        description: "Vui lòng điền ít nhất tên và email.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await axiosInstance.put(`/v1/customers/${updateForm.customerId}`, {
        name: updateForm.name,
        address: updateForm.address,
        phone: updateForm.phone,
        email: updateForm.email,
        note: updateForm.note,
      });
      setCustomers(
        customers.map((customer) =>
          customer.customerId === updateForm.customerId
            ? { ...customer, ...updateForm }
            : customer
        )
      );
      toast({
        title: "Đã cập nhật khách hàng",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setUpdateForm({ customerId: null, name: "", address: "", phone: "", email: "", note: "" });
      onUpdateClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật khách hàng:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi cập nhật khách hàng",
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
      await axiosInstance.delete(`/v1/customers/${deleteCustomerId}`);
      setCustomers(customers.filter((customer) => customer.customerId !== deleteCustomerId));
      toast({
        title: "Đã xóa khách hàng",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
    } catch (error) {
      console.error("Lỗi khi xóa khách hàng:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi xóa khách hàng",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open update modal with pre-filled data
  const openUpdateModal = (customer) => {
    setUpdateForm({
      customerId: customer.customerId,
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
      note: customer.note,
    });
    onUpdateOpen();
  };

  return (
    <Box pt={{ base: "120px", md: "60px", xl: "60px" }} px="24px">
      <VStack spacing="24px" align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg" color={accentColor} fontWeight="extrabold">
            Quản lý khách hàng
          </Heading>
        </Flex>

        {loading ? (
          <Text textAlign="center" color={textColor} fontSize="lg">
            Đang tải...
          </Text>
        ) : customers.length === 0 ? (
          <Text textAlign="center" color={textColor} fontSize="lg">
            Không tìm thấy khách hàng
          </Text>
        ) : (
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}
            gap="6"
          >
            {customers.map((customer) => (
              <Card
                key={customer.customerId}
                bg={bgColor}
                borderRadius="xl"
                boxShadow="lg"
                p="6"
                transition="all 0.3s"
                _hover={{
                  transform: "scale(1.02)",
                  boxShadow: "xl",
                  bg: hoverBg,
                }}
                border="2px solid"
                borderColor="transparent"
                // Gradient border effect
                sx={{
                  backgroundClip: "padding-box",
                  borderImage: "linear-gradient(45deg, teal.500, purple.500) 1",
                }}
              >
                <VStack align="start" spacing="3">
                  <Flex justify="space-between" w="full">
                    <Tag size="md" variant="solid" bg={accentColor} color="white">
                      {branchId}
                    </Tag>
                    <Flex gap="2">
                      <IconButton
                        icon={<MdEdit />}
                        colorScheme="purple"
                        size="sm"
                        onClick={() => openUpdateModal(customer)}
                        aria-label="Cập nhật khách hàng"
                        _hover={{ transform: "scale(1.1)" }}
                      />
                      <IconButton
                        icon={<MdDelete />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => {
                          setDeleteCustomerId(customer.customerId);
                          onDeleteOpen();
                        }}
                        aria-label="Xóa khách hàng"
                        _hover={{ transform: "scale(1.1)" }}
                      />
                    </Flex>
                  </Flex>
                  <Text fontWeight="bold" color={textColor}>
                    ID: {customer.customerId}
                  </Text>
                  <Text color={textColor}>Tên: {customer.name}</Text>
                  <Text color={textColor}>Địa chỉ: {customer.address}</Text>
                  <Text color={textColor}>Số điện thoại: {customer.phone || "N/A"}</Text>
                  <Text color={textColor}>Email: {customer.email}</Text>
                  <Text color={textColor}>Ghi chú: {customer.note || "N/A"}</Text>
                  <Text fontSize="sm" color="gray.500">
                    Tạo: {new Date(customer.createdTime).toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Cập nhật: {new Date(customer.updatedTime).toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Người tạo: {customer.createdBy}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Người cập nhật: {customer.updatedBy}
                  </Text>
                </VStack>
              </Card>
            ))}
          </Grid>
        )}
      </VStack>

      {/* Update Customer Modal */}
      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose}>
        <ModalOverlay />
        <ModalContent
          bg={bgColor}
          borderRadius="xl"
          border="2px solid"
          borderColor="transparent"
          sx={{
            backgroundClip: "padding-box",
            borderImage: "linear-gradient(45deg, teal.500, purple.500) 1",
          }}
        >
          <ModalHeader color={accentColor} fontWeight="extrabold">
            Cập nhật khách hàng
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing="4">
              <FormControl>
                <FormLabel color={textColor} fontWeight="bold">
                  Tên
                </FormLabel>
                <Input
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                  placeholder="Nhập tên khách hàng"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor} fontWeight="bold">
                  Địa chỉ
                </FormLabel>
                <Input
                  value={updateForm.address}
                  onChange={(e) => setUpdateForm({ ...updateForm, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor} fontWeight="bold">
                  Số điện thoại
                </FormLabel>
                <Input
                  value={updateForm.phone}
                  onChange={(e) => setUpdateForm({ ...updateForm, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor} fontWeight="bold">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  value={updateForm.email}
                  onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                  placeholder="Nhập email"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor} fontWeight="bold">
                  Ghi chú
                </FormLabel>
                <Input
                  value={updateForm.note}
                  onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                  placeholder="Nhập ghi chú"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={handleUpdate}
              _hover={{ transform: "scale(1.05)", bg: "teal.700" }}
            >
              Cập nhật
            </Button>
            <Button
              variant="ghost"
              onClick={onUpdateClose}
              _hover={{ transform: "scale(1.05)", bg: "gray.200" }}
            >
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent
          bg={bgColor}
          borderRadius="xl"
          border="2px solid"
          borderColor="transparent"
          sx={{
            backgroundClip: "padding-box",
            borderImage: "linear-gradient(45deg, teal.500, purple.500) 1",
          }}
        >
          <ModalHeader color={accentColor} fontWeight="extrabold">
            Xác nhận xóa
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color={textColor}>
              Bạn có chắc chắn muốn xóa khách hàng này?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={handleDelete}
              _hover={{ transform: "scale(1.05)", bg: "red.600", animation: "pulse 0.5s infinite" }}
            >
              Xóa
            </Button>
            <Button
              variant="ghost"
              onClick={onDeleteClose}
              _hover={{ transform: "scale(1.05)", bg: "gray.200" }}
            >
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}