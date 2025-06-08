import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
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
  Spinner,
  FormErrorMessage,
  Tooltip,
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React, { useState, useEffect } from "react";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import axiosInstance from "api/axios";

export default function Customers() {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("teal.600", "teal.300");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [errors, setErrors] = useState({ name: "", email: "" });

  // Add modal state
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [addForm, setAddForm] = useState({
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
        const customerData = Array.isArray(response.data.data) ? response.data.data : [];
        setCustomers(customerData);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Lỗi khi lấy danh sách khách hàng",
          description: error.response?.data?.message || "Có lỗi xảy ra.",
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

  // Validate form
  const validateForm = (form) => {
    const newErrors = { name: "", email: "" };
    let isValid = true;

    if (!form.name) {
      newErrors.name = "Tên là bắt buộc";
      isValid = false;
    }
    if (!form.email) {
      newErrors.email = "Email là bắt buộc";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Định dạng email không hợp lệ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle Add
  const handleAdd = async () => {
    if (!validateForm(addForm)) return;

    try {
      const response = await axiosInstance.post("/v1/customers", {
        ...addForm,
        dbType: branchId,
      });
      setCustomers([...customers, response.data.data]);
      toast({
        title: "Đã thêm khách hàng",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setAddForm({ name: "", address: "", phone: "", email: "", note: "" });
      setErrors({ name: "", email: "" });
      onAddClose();
    } catch (error) {
      toast({
        title: "Lỗi khi thêm khách hàng",
        description: error.response?.data?.message || "Có lỗi xảy ra.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Update
  const handleUpdate = async () => {
    if (!validateForm(updateForm)) return;

    try {
      await axiosInstance.put(`/v1/customers/${updateForm.customerId}`, updateForm);
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
      setErrors({ name: "", email: "" });
      onUpdateClose();
    } catch (error) {
      toast({
        title: "Lỗi khi cập nhật khách hàng",
        description: error.response?.data?.message || "Có lỗi xảy ra.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Delete
  const handleDelete = async () => {
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
      toast({
        title: "Lỗi khi xóa khách hàng",
        description: error.response?.data?.message || "Có lỗi xảy ra.",
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
      address: customer.address || "",
      phone: customer.phone || "",
      email: customer.email || "",
      note: customer.note || "",
    });
    setErrors({ name: "", email: "" });
    onUpdateOpen();
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box pt={{ base: "100px", md: "60px" }} px={{ base: "16px", md: "24px" }}>
      <VStack spacing="16px" align="stretch">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
          <Heading size="lg" color={accentColor} fontWeight="extrabold">
            Quản lý khách hàng
          </Heading>
          <Flex gap="4">
            <Input
              placeholder="Tìm kiếm theo tên hoặc email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW={{ base: "100%", md: "300px" }}
              borderColor={accentColor}
              _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
              aria-label="Tìm kiếm khách hàng"
            />
            <Button
              colorScheme="teal"
              leftIcon={<MdAdd />}
              onClick={onAddOpen}
              _hover={{ transform: "scale(1.05)" }}
            >
              Thêm khách hàng
            </Button>
          </Flex>
        </Flex>

        {loading ? (
          <Flex justify="center" py="10">
            <Spinner size="xl" color={accentColor} />
          </Flex>
        ) : filteredCustomers.length === 0 ? (
          <Text textAlign="center" color={textColor} fontSize="lg">
            Không tìm thấy khách hàng
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="16px">
            {filteredCustomers.map((customer) => (
              <Card
                key={customer.customerId}
                bg={bgColor}
                borderRadius="xl"
                boxShadow="md"
                p="5"
                transition="all 0.3s"
                _hover={{
                  transform: "scale(1.02)",
                  boxShadow: "lg",
                  bg: hoverBg,
                }}
                border="2px solid"
                borderColor="transparent"
                sx={{
                  backgroundClip: "padding-box",
                  borderImage: "linear-gradient(45deg, teal.500, purple.500) 1",
                }}
              >
                <VStack align="start" spacing="2">
                  <Flex justify="space-between" w="full">
                    <Tag size="sm" variant="solid" bg={accentColor} color="white">
                      {branchId}
                    </Tag>
                    <Flex gap="2">
                      <Tooltip label="Cập nhật khách hàng">
                        <IconButton
                          icon={<MdEdit />}
                          colorScheme="purple"
                          size="md"
                          onClick={() => openUpdateModal(customer)}
                          aria-label="Cập nhật khách hàng"
                          _hover={{ transform: "scale(1.1)" }}
                        />
                      </Tooltip>
                      <Tooltip label="Xóa khách hàng">
                        <IconButton
                          icon={<MdDelete />}
                          colorScheme="red"
                          size="md"
                          onClick={() => {
                            setDeleteCustomerId(customer.customerId);
                            onDeleteOpen();
                          }}
                          aria-label="Xóa khách hàng"
                          _hover={{ transform: "scale(1.1)" }}
                        />
                      </Tooltip>
                    </Flex>
                  </Flex>
                  <Text fontWeight="bold" fontSize="lg" color={textColor}>
                    {customer.name}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    ID: {customer.customerId}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Địa chỉ: {customer.address || "N/A"}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Số điện thoại: {customer.phone || "N/A"}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Email: {customer.email}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    Ghi chú: {customer.note || "N/A"}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Tạo: {new Date(customer.createdTime).toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Cập nhật: {new Date(customer.updatedTime).toLocaleString()}
                  </Text>
                </VStack>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Add Customer Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size={{ base: "full", md: "md" }}>
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
          mx={{ base: 2, md: 0 }}
        >
          <ModalHeader color={accentColor} fontWeight="extrabold">
            Thêm khách hàng
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing="4">
              <FormControl isInvalid={errors.name}>
                <FormLabel color={textColor} fontWeight="bold">
                  Tên
                </FormLabel>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Nhập tên khách hàng"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                  aria-label="Tên khách hàng"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel color={textColor} fontWeight="bold">
                  Địa chỉ
                </FormLabel>
                <Input
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                  aria-label="Địa chỉ khách hàng"
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor} fontWeight="bold">
                  Số điện thoại
                </FormLabel>
                <Input
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                  aria-label="Số điện thoại khách hàng"
                />
              </FormControl>
              <FormControl isInvalid={errors.email}>
                <FormLabel color={textColor} fontWeight="bold">
                  Email
                </FormLabel>
                <Input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="Nhập email"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                  aria-label="Email khách hàng"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel color={textColor} fontWeight="bold">
                  Ghi chú
                </FormLabel>
                <Input
                  value={addForm.note}
                  onChange={(e) => setAddForm({ ...addForm, note: e.target.value })}
                  placeholder="Nhập ghi chú"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                  aria-label="Ghi chú khách hàng"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={handleAdd}
              _hover={{ transform: "scale(1.05)" }}
            >
              Thêm
            </Button>
            <Button
              variant="ghost"
              onClick={onAddClose}
              _hover={{ transform: "scale(1.05)", bg: "gray.200" }}
            >
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Update Customer Modal */}
      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose} size={{ base: "full", md: "md" }}>
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
          mx={{ base: 2, md: 0 }}
        >
          <ModalHeader color={accentColor} fontWeight="extrabold">
            Cập nhật khách hàng
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing="4">
              <FormControl isInvalid={errors.name}>
                <FormLabel color={textColor} fontWeight="bold">
                  Tên
                </FormLabel>
                <Input
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                  placeholder="Nhập tên khách hàng"
                  borderColor={accentColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                  aria-label="Tên khách hàng"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
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
                  aria-label="Địa chỉ khách hàng"
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
                  aria-label="Số điện thoại khách hàng"
                />
              </FormControl>
              <FormControl isInvalid={errors.email}>
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
                  aria-label="Email khách hàng"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
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
                  aria-label="Ghi chú khách hàng"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={handleUpdate}
              _hover={{ transform: "scale(1.05)" }}
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
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size={{ base: "full", md: "sm" }}>
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
          mx={{ base: 2, md: 0 }}
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
              _hover={{ transform: "scale(1.05)", bg: "red.600" }}
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