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
  Tooltip,
  Fade,
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React, { useState, useEffect } from "react";
import { MdAdd, MdDelete, MdChevronLeft, MdChevronRight } from "react-icons/md";
import axiosInstance from "api/axios";

export default function Imports() {
  const brandColor = useColorModeValue("teal.600", "teal.300");
  const boxBg = useColorModeValue("gray.50", "gray.700");
  const tableBg = useColorModeValue("white", "gray.800");
  const [imports, setImports] = useState([]);
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
  const branchId = user.branchId || "HN";
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

        // Fetch imports
        const importsResponse = await axiosInstance.get(`/v1/imports/?dbType=${branchId}`);
        const importData = Array.isArray(importsResponse.data.data) ? importsResponse.data.data : [];
        importData.forEach((imp) => {
          if (!imp.details || !Array.isArray(imp.details)) {
            console.warn(`Phiếu nhập ${imp.importId} không có details hợp lệ:`, imp);
          }
        });
        setImports(importData);

        // Fetch products
        const productsResponse = await axiosInstance.get(`/v1/products/?dbType=${branchId}`);
        const productData = Array.isArray(productsResponse.data.data) ? productsResponse.data.data : [];
        setProducts(productData);

        setLoading(false);
      } catch (error) {
        toast({
          title: "Lỗi khi lấy dữ liệu",
          description: error.response?.data?.message || "Có lỗi xảy ra.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setImports([]);
        setOrders([]);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [branchId, accessToken, toast, itemsPerPage]);

  // Calculate total imported quantity for a product in an order
  const getTotalImportedQuantity = (orderId, productId) => {
    return imports
      .filter((imp) => imp.orderId === orderId)
      .reduce((total, imp) => {
        if (!imp.details || !Array.isArray(imp.details)) return total;
        const detail = imp.details.find((d) => d.productId === parseInt(productId));
        return total + (detail ? parseInt(detail.quantity || 0) : 0);
      }, 0);
  };

  // Validate form and check quantity limits
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

    if (selectedOrder.type !== "import" || ["completed"].includes(selectedOrder.status)) {
      newErrors.orderId = `Đơn hàng ${createForm.orderId} không thể tạo phiếu nhập (loại: ${selectedOrder.type}, trạng thái: ${selectedOrder.status})`;
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
      } else {
        const orderDetail = selectedOrder.details.find((d) => d.productId === parseInt(detail.productId));
        if (orderDetail) {
          const totalImported = getTotalImportedQuantity(createForm.orderId, detail.productId);
          const newQuantity = parseInt(detail.quantity);
          const maxQuantity = parseInt(orderDetail.quantity);
          if (totalImported + newQuantity > maxQuantity) {
            newErrors.details[index].quantity = `Số lượng vượt quá giới hạn (${maxQuantity - totalImported} ${orderDetail.productUnit} còn lại)`;
            isValid = false;
          }
        } else {
          newErrors.details[index].productId = "Sản phẩm không thuộc đơn hàng";
          isValid = false;
        }
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

    const selectedOrder = orders.find((order) => order.orderId === createForm.orderId);
    for (const detail of createForm.details) {
      const orderDetail = selectedOrder.details.find((d) => d.productId === parseInt(detail.productId));
      if (!orderDetail) continue;
      const totalImported = getTotalImportedQuantity(createForm.orderId, detail.productId);
      const newQuantity = parseInt(detail.quantity);
      const maxQuantity = parseInt(orderDetail.quantity);
      if (totalImported + newQuantity > maxQuantity) {
        toast({
          title: "Lỗi số lượng",
          description: `Sản phẩm ${orderDetail.productName} đã nhập đủ ${maxQuantity} ${orderDetail.productUnit} theo đơn hàng ${createForm.orderId}.`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/v1/imports/", {
        orderId: createForm.orderId,
        details: createForm.details.map((detail) => ({
          productId: parseInt(detail.productId),
          quantity: parseInt(detail.quantity),
        })),
      });
      setImports([...imports, response.data.data]);
      toast({
        title: "Đã tạo phiếu nhập",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCreateForm({ orderId: "", details: [] });
      setErrors({ orderId: "", details: [] });
      onCreateClose();
    } catch (error) {
      toast({
        title: "Lỗi khi tạo phiếu nhập",
        description: error.response?.data?.message || "Có lỗi xảy ra.",
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
    <Box pt={{ base: "100px", md: "60px" }} px={{ base: "16px", md: "24px" }}>
      <VStack spacing="16px" align="stretch">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
          <Heading size="lg" color={brandColor} fontWeight="extrabold">
            Quản lý phiếu nhập kho
          </Heading>
          <Button
            leftIcon={<MdAdd />}
            colorScheme="teal"
            onClick={onCreateOpen}
            _hover={{ transform: "scale(1.05)" }}
          >
            Tạo phiếu nhập
          </Button>
        </Flex>

        <Card bg={tableBg} borderRadius="xl" boxShadow="md" p="5">
          <Box overflowX="auto">
            <Table variant="simple" colorScheme="teal" size="md">
              <Thead bg={brandColor}>
                <Tr>
                  <Th color="white" fontSize="sm">Import ID</Th>
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
                      <Spinner size="md" color={brandColor} />
                    </Td>
                  </Tr>
                ) : imports.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py="4">
                      Không tìm thấy phiếu nhập
                    </Td>
                  </Tr>
                ) : (
                  imports.map((importItem) => (
                    <Tr
                      key={importItem.importId}
                      _hover={{ bg: boxBg }}
                      transition="background 0.2s"
                    >
                      <Td fontSize="sm">{importItem.importId}</Td>
                      <Td fontSize="sm">{importItem.orderId}</Td>
                      <Td fontSize="sm">{importItem.warehouseId}</Td>
                      <Td fontSize="sm">{new Date(importItem.createdTime).toLocaleString()}</Td>
                      <Td fontSize="sm">{new Date(importItem.updatedTime).toLocaleString()}</Td>
                      <Td fontSize="sm">{importItem.createdBy}</Td>
                      <Td fontSize="sm">{importItem.updatedBy}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Card>
      </VStack>

      {/* Create Import Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size={{ base: "full", md: "md" }}>
        <ModalOverlay />
        <ModalContent
          bg={tableBg}
          borderRadius="xl"
          border="2px solid"
          borderColor="transparent"
          sx={{
            backgroundClip: "padding-box",
            borderImage: "linear-gradient(45deg, teal.500, purple.500) 1",
          }}
          mx={{ base: 2, md: 0 }}
        >
          <ModalHeader color={brandColor} fontWeight="extrabold">
            Tạo phiếu nhập mới
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl isInvalid={errors.orderId}>
                <FormLabel fontSize="sm" fontWeight="bold" color={brandColor}>
                  ID Đơn hàng
                </FormLabel>
                <Select
                  value={createForm.orderId}
                  onChange={(e) => setCreateForm({ ...createForm, orderId: e.target.value, details: [] })}
                  placeholder="Chọn đơn hàng"
                  size="md"
                  borderColor={brandColor}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                  aria-label="Chọn đơn hàng"
                >
                  {orders
                    .filter((order) => order.type === "import" && ["init", "in-progress"].includes(order.status))
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
                <FormLabel fontSize="sm" fontWeight="bold" color={brandColor}>
                  Chi tiết sản phẩm
                </FormLabel>
                {createForm.details.map((detail, index) => (
                  <Flex
                    key={index}
                    align="center"
                    mb="3"
                    gap="3"
                    flexWrap={{ base: "wrap", md: "nowrap" }}
                  >
                    <FormControl isInvalid={errors.details[index]?.productId}>
                      <Select
                        placeholder="Chọn sản phẩm"
                        value={detail.productId}
                        onChange={(e) => updateProductDetail(index, "productId", e.target.value)}
                        size="md"
                        flex={{ base: "1 1 100%", md: "2" }}
                        borderColor={brandColor}
                        _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                        aria-label={`Chọn sản phẩm ${index + 1}`}
                      >
                        {getFilteredProducts().map((product) => (
                          <option key={product.productId} value={product.productId}>
                            {product.name} (ID: {product.productId}, Đơn vị: {product.unit})
                          </option>
                        ))}
                      </Select>
                      <Fade in={errors.details[index]?.productId}>
                        <FormErrorMessage>{errors.details[index]?.productId}</FormErrorMessage>
                      </Fade>
                    </FormControl>
                    <FormControl isInvalid={errors.details[index]?.quantity}>
                      <Input
                        placeholder="Số lượng"
                        type="number"
                        value={detail.quantity}
                        onChange={(e) => updateProductDetail(index, "quantity", e.target.value)}
                        size="md"
                        flex={{ base: "1 1 100%", md: "1" }}
                        borderColor={brandColor}
                        _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                        aria-label={`Số lượng sản phẩm ${index + 1}`}
                      />
                      <Fade in={errors.details[index]?.quantity}>
                        <FormErrorMessage>{errors.details[index]?.quantity}</FormErrorMessage>
                      </Fade>
                    </FormControl>
                    <Tooltip label="Xóa sản phẩm">
                      <IconButton
                        icon={<MdDelete />}
                        colorScheme="red"
                        size="md"
                        onClick={() => removeProductFromDetails(index)}
                        aria-label={`Xóa sản phẩm ${index + 1}`}
                        _hover={{ transform: "scale(1.1)" }}
                      />
                    </Tooltip>
                  </Flex>
                ))}
                <Button
                  leftIcon={<MdAdd />}
                  colorScheme="teal"
                  size="sm"
                  mt="3"
                  onClick={addProductToDetails}
                  isDisabled={!createForm.orderId}
                  _hover={{ transform: "scale(1.05)" }}
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
              _hover={{ transform: "scale(1.05)" }}
            >
              Tạo
            </Button>
            <Button
              variant="ghost"
              onClick={onCreateClose}
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