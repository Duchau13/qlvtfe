import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr, 
  Th,
  Td,
  useColorModeValue,
  useToast,
  VStack,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  IconButton,
  Spinner,
  FormErrorMessage,
  Fade,
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React, { useState, useEffect } from "react";
import { MdAdd, MdDelete } from "react-icons/md";
import axiosInstance from "api/axios";

export default function Exports() {
  const brandColor = useColorModeValue("teal.600", "teal.300");
  const boxBg = useColorModeValue("gray.50", "gray.700");
  const tableBg = useColorModeValue("white", "gray.800");
  const [exports, setExports] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  // Create modal state
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [createForm, setCreateForm] = useState({
    orderId: "",
    details: [],
  });
  const [errors, setErrors] = useState({ orderId: "", details: [] });

  // Get branchId from user object and accessToken from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const branchId = user.branchId || "HCM";
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
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
        // Fetch all orders with pagination
        let allOrders = [];
        let page = 1;

        while (true) {
          const ordersResponse = await axiosInstance.get(`/v1/orders/?dbType=${branchId}&page=${page}&limit=${itemsPerPage}`);
          const orderData = Array.isArray(ordersResponse.data.data) ? ordersResponse.data.data : [];
          allOrders = [...allOrders, ...orderData];
          const pagination = ordersResponse.data.pagination || {};
          if (pagination.total && pagination.limit) {
            setTotalPages(Math.ceil(pagination.total / pagination.limit));
          }
          if (page * itemsPerPage >= (pagination.total || allOrders.length)) break;
          page++;
        }

        console.log("All Orders:", allOrders);
        setOrders(allOrders);

        // Fetch exports
        const exportsResponse = await axiosInstance.get(`/v1/exports/?dbType=${branchId}`);
        console.log("Exports API Response:", exportsResponse.data);
        const exportData = Array.isArray(exportsResponse.data.data) ? exportsResponse.data.data : [];
        setExports(exportData);

        // Fetch products
        const productsResponse = await axiosInstance.get(`/v1/products/?dbType=${branchId}`);
        console.log("Products API Response:", productsResponse.data);
        const productData = Array.isArray(productsResponse.data.data) ? productsResponse.data.data : [];
        setProducts(productData);

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        toast({
          title: "Lỗi khi lấy dữ liệu",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setExports([]);
        setOrders([]);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [branchId, accessToken, toast, itemsPerPage]);

  // Validate form
  const validateForm = () => {
    const newErrors = { orderId: "", details: createForm.details.map(() => ({ productId: "", quantity: "" })) };
    let isValid = true;

    if (!createForm.orderId) {
      newErrors.orderId = "Vui lòng chọn đơn hàng";
      isValid = false;
    }

    const selectedOrder = orders.find((order) => order.orderId === createForm.orderId);
    if (!selectedOrder) {
      newErrors.orderId = "Đơn hàng không tồn tại";
      isValid = false;
      setErrors(newErrors);
      return isValid;
    }

    // Chỉ cho phép tạo phiếu xuất cho đơn hàng type="export" và status="init" hoặc "in-progress"
    if (selectedOrder.type !== "export" || ["completed"].includes(selectedOrder.status)) {
      newErrors.orderId = `Đơn hàng ${createForm.orderId} không thể tạo phiếu xuất (loại: ${selectedOrder.type}, trạng thái: ${selectedOrder.status})`;
      isValid = false;
    }

    createForm.details.forEach((detail, index) => {
      if (!detail.productId) {
        newErrors.details[index].productId = "Vui lòng chọn sản phẩm";
        isValid = false;
      }
      if (!detail.quantity || parseInt(detail.quantity) <= 0) {
        newErrors.details[index].quantity = "Số lượng phải lớn hơn 0";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle Create
  const handleCreate = async () => {
    if (!validateForm()) return;

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

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/v1/exports/", {
        orderId: createForm.orderId,
        details: createForm.details.map((detail) => ({
          productId: parseInt(detail.productId),
          quantity: parseInt(detail.quantity),
        })),
      });
      setExports([...exports, response.data.data]);
      toast({
        title: "Đã tạo phiếu xuất",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCreateForm({ orderId: "", details: [] });
      setErrors({ orderId: "", details: [] });
      onCreateClose();
    } catch (error) {
      console.error("Lỗi khi tạo phiếu xuất:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi tạo phiếu xuất",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add product to details
  const addProductToDetails = () => {
    setCreateForm({
      ...createForm,
      details: [...createForm.details, { productId: "", quantity: "" }],
    });
    setErrors({
      ...errors,
      details: [...errors.details, { productId: "", quantity: "" }],
    });
  };

  // Remove product from details
  const removeProductFromDetails = (index) => {
    setCreateForm({
      ...createForm,
      details: createForm.details.filter((_, i) => i !== index),
    });
    setErrors({
      ...errors,
      details: errors.details.filter((_, i) => i !== index),
    });
  };

  // Update product details
  const updateProductDetail = (index, field, value) => {
    const updatedDetails = [...createForm.details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setCreateForm({ ...createForm, details: updatedDetails });
  };

  // Get filtered products based on selected order
  const getFilteredProducts = () => {
    if (!createForm.orderId) return [];
    const selectedOrder = orders.find((order) => order.orderId === createForm.orderId);
    if (!selectedOrder || !selectedOrder.details || selectedOrder.details.length === 0) return [];
    return selectedOrder.details.map((detail) => ({
      productId: detail.productId,
      name: detail.productName,
      unit: detail.productUnit,
    }));
  };

  return (
    <Box pt={{ base: "120px", md: "60px", xl: "60px" }} px="24px">
      <VStack spacing="24px" align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg" color={brandColor}>
            Quản lý phiếu xuất kho
          </Heading>
          <Button
            leftIcon={<MdAdd />}
            colorScheme="teal"
            onClick={onCreateOpen}
          >
            Tạo phiếu xuất
          </Button>
        </Flex>

        <Card bg={tableBg} borderRadius="xl" boxShadow="2xl" p="6">
          <Box overflowX="auto">
            <Table variant="simple" colorScheme="teal" size="md">
              <Thead bg={brandColor}>
                <Tr>
                  <Th color="white" fontSize="sm">Export ID</Th>
                  <Th color="white" fontSize="sm">Order ID</Th>
                  <Th color="white" fontSize="sm">Warehouse ID</Th>
                  <Th color="white" fontSize="sm">Thời gian tạo</Th>
                  <Th color="white" fontSize="sm">Thời gian cập nhật</Th>
                  <Th color="white" fontSize="sm">Người tạo</Th>
                  <Th color="white" fontSize="sm">Người cập nhật</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py="4">
                      Đang tải...
                    </Td>
                  </Tr>
                ) : exports.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py="4">
                      Không tìm thấy phiếu xuất
                    </Td>
                  </Tr>
                ) : (
                  exports.map((exportItem) => (
                    <Tr
                      key={exportItem.exportId}
                      _hover={{ bg: boxBg }}
                      transition="background 0.2s"
                    >
                      <Td>{exportItem.exportId}</Td>
                      <Td>{exportItem.orderId}</Td>
                      <Td>{exportItem.warehouseId}</Td>
                      <Td>{new Date(exportItem.createdTime).toLocaleString()}</Td>
                      <Td>{new Date(exportItem.updatedTime).toLocaleString()}</Td>
                      <Td>{exportItem.createdBy}</Td>
                      <Td>{exportItem.updatedBy}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Card>
      </VStack>

      {/* Create Export Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tạo phiếu xuất mới</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl isInvalid={errors.orderId}>
                <FormLabel>ID Đơn hàng</FormLabel>
                <Select
                  value={createForm.orderId}
                  onChange={(e) => setCreateForm({ ...createForm, orderId: e.target.value, details: [] })}
                  placeholder="Chọn đơn hàng"
                >
                  {orders
                    .filter((order) => order.type === "export" && ["init", "in-progress"].includes(order.status))
                    .map((order) => (
                      <option key={order.orderId} value={order.orderId}>
                        {order.orderId}
                      </option>
                    ))}
                </Select>
                <Fade in={errors.orderId}>
                  <FormErrorMessage>{errors.orderId}</FormErrorMessage>
                </Fade>
              </FormControl>
              <FormControl>
                <FormLabel>Chi tiết sản phẩm</FormLabel>
                {createForm.details.map((detail, index) => (
                  <Flex key={index} align="center" mb="2" gap="2">
                    <Select
                      placeholder="Chọn sản phẩm"
                      value={detail.productId}
                      onChange={(e) => updateProductDetail(index, "productId", e.target.value)}
                      flex="2"
                    >
                      {getFilteredProducts().map((product) => (
                        <option key={product.productId} value={product.productId}>
                          {product.name} (ID: {product.productId}, Đơn vị: {product.unit})
                        </option>
                      ))}
                    </Select>
                    <Input
                      placeholder="Số lượng"
                      type="number"
                      value={detail.quantity}
                      onChange={(e) => updateProductDetail(index, "quantity", e.target.value)}
                      flex="1"
                    />
                    <IconButton
                      icon={<MdDelete />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => removeProductFromDetails(index)}
                    />
                  </Flex>
                ))}
                <Button
                  leftIcon={<MdAdd />}
                  colorScheme="teal"
                  size="sm"
                  mt="2"
                  onClick={addProductToDetails}
                  isDisabled={!createForm.orderId}
                >
                  Thêm sản phẩm
                </Button>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={handleCreate}
              isLoading={isSubmitting}
              loadingText="Đang tạo"
            >
              Tạo
            </Button>
            <Button variant="ghost" onClick={onCreateClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}