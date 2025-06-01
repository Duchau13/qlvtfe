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
  Text,
  Link,
  IconButton,
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import React, { useState, useEffect } from "react";
import { MdAdd, MdDelete } from "react-icons/md";
import axiosInstance from "api/axios";

export default function Order() {
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const tableBg = useColorModeValue("white", "gray.800");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const toast = useToast();

  // Create modal state
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [createForm, setCreateForm] = useState({
    type: "import",
    sourceWarehouseId: "",
    destinationWarehouseId: "",
    customerId: "",
    details: [],
  });

  // Delete confirmation modal state
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  // Update status modal state
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const [updateForm, setUpdateForm] = useState({ orderId: null, status: "" });

  // Update details modal state
  const { isOpen: isUpdateDetailsOpen, onOpen: onUpdateDetailsOpen, onClose: onUpdateDetailsClose } = useDisclosure();
  const [updateDetailsForm, setUpdateDetailsForm] = useState({ orderId: null, details: [] });

  // Details modal state
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  // Get branchId from user object and accessToken from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const dbType = user.branchId || "HN";
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    // Fetch orders, warehouses, and products
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
        // Fetch orders
        const ordersResponse = await axiosInstance.get(`/v1/orders/?dbType=${dbType}`);
        console.log("Orders API Response:", ordersResponse.data);
        const orderData = Array.isArray(ordersResponse.data.data) ? ordersResponse.data.data : [];
        setOrders(orderData);

        // Fetch warehouses
        const warehousesResponse = await axiosInstance.get(`/v1/warehouses/?dbType=${dbType}`);
        console.log("Warehouses API Response:", warehousesResponse.data);
        const warehouseData = Array.isArray(warehousesResponse.data.data) ? warehousesResponse.data.data : [];
        setWarehouses(warehouseData);

        // Fetch products
        const productsResponse = await axiosInstance.get(`/v1/products/?dbType=${dbType}`);
        console.log("Products API Response:", productsResponse.data);
        const productData = Array.isArray(productsResponse.data.data) ? productsResponse.data.data : [];
        setProducts(productData);

        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi gọi API:", {
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
        setOrders([]);
        setWarehouses([]);
        setProducts([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [dbType, accessToken, toast]);

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
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

    setDetailsLoading(true);
    try {
      const response = await axiosInstance.get(`/v1/orders/${orderId}?dbType=${dbType}`);
      console.log("Order Details Response:", response.data);
      setOrderDetails(response.data.data);
      setDetailsLoading(false);
      onDetailsOpen();
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi lấy chi tiết đơn hàng",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setDetailsLoading(false);
    }
  };

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

    if (!createForm.type || !createForm.customerId || createForm.details.length === 0 || (!createForm.sourceWarehouseId && !createForm.destinationWarehouseId)) {
      toast({
        title: "Lỗi nhập liệu",
        description: "Vui lòng điền loại đơn hàng, ID khách hàng, thêm ít nhất một sản phẩm, và chọn ít nhất một kho (nguồn hoặc đích).",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axiosInstance.post("/v1/orders/", {
        type: createForm.type,
        sourceWarehouseId: createForm.sourceWarehouseId ? parseInt(createForm.sourceWarehouseId) : null,
        destinationWarehouseId: createForm.destinationWarehouseId ? parseInt(createForm.destinationWarehouseId) : null,
        customerId: parseInt(createForm.customerId),
        details: createForm.details.map((detail) => ({
          productId: parseInt(detail.productId),
          quantity: parseInt(detail.quantity),
          price: parseInt(detail.price),
        })),
      });
      setOrders([...orders, response.data.data]);
      toast({
        title: "Đã tạo đơn hàng",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCreateForm({ type: "import", sourceWarehouseId: "", destinationWarehouseId: "", customerId: "", details: [] });
      onCreateClose();
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi tạo đơn hàng",
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
      await axiosInstance.delete(`/v1/orders/${deleteOrderId}`);
      setOrders(orders.filter((order) => order.orderId !== deleteOrderId));
      toast({
        title: "Đã xóa đơn hàng",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi xóa đơn hàng",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async () => {
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
      const endpoint = updateForm.status === "completed"
        ? `/v1/orders/${updateForm.orderId}/complete`
        : `/v1/orders/${updateForm.orderId}/in-progress`;
      await axiosInstance.put(endpoint, {});
      setOrders(
        orders.map((order) =>
          order.orderId === updateForm.orderId
            ? { ...order, status: updateForm.status }
            : order
        )
      );
      toast({
        title: "Đã cập nhật trạng thái đơn hàng",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setUpdateForm({ orderId: null, status: "" });
      onUpdateClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi cập nhật trạng thái đơn hàng",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Update Details
  const handleUpdateDetails = async () => {
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

    if (updateDetailsForm.details.length === 0) {
      toast({
        title: "Lỗi nhập liệu",
        description: "Vui lòng thêm ít nhất một sản phẩm.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await axiosInstance.post(`/v1/orders/${updateDetailsForm.orderId}/details`, {
        details: updateDetailsForm.details.map((detail) => ({
          productId: parseInt(detail.productId),
          quantity: parseInt(detail.quantity),
          price: parseInt(detail.price),
        })),
      });
      setOrders(
        orders.map((order) =>
          order.orderId === updateDetailsForm.orderId
            ? { ...order, details: updateDetailsForm.details }
            : order
        )
      );
      toast({
        title: "Đã cập nhật chi tiết đơn hàng",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setUpdateDetailsForm({ orderId: null, details: [] });
      onUpdateDetailsClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật chi tiết đơn hàng:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi cập nhật chi tiết đơn hàng",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open update status modal with pre-filled data
  const openUpdateModal = (order) => {
    setUpdateForm({ orderId: order.orderId, status: order.status });
    onUpdateOpen();
  };

  // Open update details modal with pre-filled data
  const openUpdateDetailsModal = (order) => {
    setUpdateDetailsForm({
      orderId: order.orderId,
      details: order.details.map((detail) => ({
        productId: detail.productId,
        quantity: detail.quantity,
        price: detail.price,
      })),
    });
    onUpdateDetailsOpen();
  };

  // Add product to details in create form
  const addProductToDetails = () => {
    setCreateForm({
      ...createForm,
      details: [...createForm.details, { productId: "", quantity: "", price: "" }],
    });
  };

  // Remove product from details in create form
  const removeProductFromDetails = (index) => {
    setCreateForm({
      ...createForm,
      details: createForm.details.filter((_, i) => i !== index),
    });
  };

  // Update product details in create form
  const updateProductDetail = (index, field, value) => {
    const updatedDetails = [...createForm.details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setCreateForm({ ...createForm, details: updatedDetails });
  };

  // Add product to details in update details form
  const addProductToUpdateDetails = () => {
    setUpdateDetailsForm({
      ...updateDetailsForm,
      details: [...updateDetailsForm.details, { productId: "", quantity: "", price: "" }],
    });
  };

  // Remove product from details in update details form
  const removeProductFromUpdateDetails = (index) => {
    setUpdateDetailsForm({
      ...updateDetailsForm,
      details: updateDetailsForm.details.filter((_, i) => i !== index),
    });
  };

  // Update product details in update details form
  const updateProductDetailForUpdate = (index, field, value) => {
    const updatedDetails = [...updateDetailsForm.details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setUpdateDetailsForm({ ...updateDetailsForm, details: updatedDetails });
  };

  return (
    <Box pt={{ base: "180px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 1, xl: 1 }} gap="20px" mb="20px">
        <Card>
          {/* Header with Create Button */}
          <Flex justify="flex-end" align="center" mb="4">
            <Button
              leftIcon={<MdAdd />}
              colorScheme="teal"
              onClick={onCreateOpen}
            >
              Tạo đơn hàng
            </Button>
          </Flex>

          {/* Orders Table */}
          <Box bg={tableBg} borderRadius="md" boxShadow="md" p="4">
            <Table variant="simple" colorScheme="teal">
              <Thead bg={brandColor} color="white">
                <Tr>
                  <Th color="white">ID Đơn hàng</Th>
                  <Th color="white">Loại</Th>
                  <Th color="white">Trạng thái</Th>
                  <Th color="white">Thời gian tạo</Th>
                  <Th color="white">Thời gian cập nhật</Th>
                  <Th color="white">Kho nguồn</Th>
                  <Th color="white">Kho đích</Th>
                  <Th color="white">Khách hàng</Th>
                  <Th color="white">Chi tiết</Th>
                  <Th color="white">Hành động</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={10} textAlign="center">
                      Đang tải...
                    </Td>
                  </Tr>
                ) : orders.length === 0 ? (
                  <Tr>
                    <Td colSpan={10} textAlign="center">
                      Không tìm thấy đơn hàng
                    </Td>
                  </Tr>
                ) : (
                  orders.map((order) => (
                    <Tr key={order.orderId} _hover={{ bg: boxBg }}>
                      <Td>
                        <Link
                          color="teal.500"
                          onClick={() => fetchOrderDetails(order.orderId)}
                          cursor="pointer"
                        >
                          {order.orderId}
                        </Link>
                      </Td>
                      <Td>{order.type}</Td>
                      <Td>{order.status}</Td>
                      <Td>{new Date(order.createdTime).toLocaleString()}</Td>
                      <Td>{new Date(order.updatedTime).toLocaleString()}</Td>
                      <Td>{order.sourceWarehouseId || "N/A"}</Td>
                      <Td>{order.destinationWarehouseId || "N/A"}</Td>
                      <Td>{order.customerId}</Td>
                      <Td>
                        {order.details.length > 0 ? (
                          <Box>
                            {order.details.map((detail, index) => (
                              <Text key={index} fontSize="sm">
                                - {detail.productName} ({detail.quantity} {detail.productUnit}, Giá: {detail.price})
                              </Text>
                            ))}
                          </Box>
                        ) : (
                          "Không có chi tiết"
                        )}
                      </Td>
                      <Td>
                        <Flex gap="2" wrap="wrap">
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => openUpdateModal(order)}
                          >
                            Cập nhật trạng thái
                          </Button>
                          {order.status !== "in-progress" && order.status !== "completed" && (
                            <Button
                              size="sm"
                              colorScheme="yellow"
                              onClick={() => openUpdateDetailsModal(order)}
                            >
                              Cập nhật chi tiết
                            </Button>
                          )}
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => {
                              setDeleteOrderId(order.orderId);
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
      </SimpleGrid>

      {/* Create Order Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tạo đơn hàng mới</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="4">
              <FormLabel>Loại đơn hàng</FormLabel>
              <Select
                value={createForm.type}
                onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
              >
                <option value="import">Import</option>
                <option value="export">Export</option>
              </Select>
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Kho nguồn</FormLabel>
              <Select
                value={createForm.sourceWarehouseId}
                onChange={(e) => setCreateForm({ ...createForm, sourceWarehouseId: e.target.value })}
                placeholder="Chọn kho nguồn"
              >
                {warehouses.map((warehouse) => (
                  <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                    {warehouse.name} (ID: {warehouse.warehouseId})
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Kho đích</FormLabel>
              <Select
                value={createForm.destinationWarehouseId}
                onChange={(e) => setCreateForm({ ...createForm, destinationWarehouseId: e.target.value })}
                placeholder="Chọn kho đích"
              >
                {warehouses.map((warehouse) => (
                  <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                    {warehouse.name} (ID: {warehouse.warehouseId})
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mb="4">
              <FormLabel>ID Khách hàng</FormLabel>
              <Input
                value={createForm.customerId}
                onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
                placeholder="Nhập ID khách hàng"
                type="number"
              />
            </FormControl>
            <FormControl mb="4">
              <FormLabel>Chi tiết sản phẩm</FormLabel>
              {createForm.details.map((detail, index) => (
                <Flex key={index} align="center" mb="2" gap="2">
                  <Select
                    placeholder="Chọn sản phẩm"
                    value={detail.productId}
                    onChange={(e) => updateProductDetail(index, "productId", e.target.value)}
                    flex="2"
                  >
                    {products.map((product) => (
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
                  <Input
                    placeholder="Giá"
                    type="number"
                    value={detail.price}
                    onChange={(e) => updateProductDetail(index, "price", e.target.value)}
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
              >
                Thêm sản phẩm
              </Button>
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Xác nhận xóa</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Bạn có chắc chắn muốn xóa đơn hàng này?
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

      {/* Update Status Modal */}
      <Modal isOpen={isUpdateOpen} onClose={onUpdateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cập nhật trạng thái đơn hàng</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Trạng thái</FormLabel>
              <Select
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
              >
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpdateStatus}>
              Cập nhật
            </Button>
            <Button variant="ghost" onClick={onUpdateClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Update Details Modal */}
      <Modal isOpen={isUpdateDetailsOpen} onClose={onUpdateDetailsClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cập nhật chi tiết đơn hàng</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="4">
              <FormLabel>Chi tiết sản phẩm</FormLabel>
              {updateDetailsForm.details.map((detail, index) => (
                <Flex key={index} align="center" mb="2" gap="2">
                  <Select
                    placeholder="Chọn sản phẩm"
                    value={detail.productId}
                    onChange={(e) => updateProductDetailForUpdate(index, "productId", e.target.value)}
                    flex="2"
                  >
                    {products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.name} (ID: {product.productId}, Đơn vị: {product.unit})
                      </option>
                    ))}
                  </Select>
                  <Input
                    placeholder="Số lượng"
                    type="number"
                    value={detail.quantity}
                    onChange={(e) => updateProductDetailForUpdate(index, "quantity", e.target.value)}
                    flex="1"
                  />
                  <Input
                    placeholder="Giá"
                    type="number"
                    value={detail.price}
                    onChange={(e) => updateProductDetailForUpdate(index, "price", e.target.value)}
                    flex="1"
                  />
                  <IconButton
                    icon={<MdDelete />}
                    colorScheme="red"
                    size="sm"
                    onClick={() => removeProductFromUpdateDetails(index)}
                  />
                </Flex>
              ))}
              <Button
                leftIcon={<MdAdd />}
                colorScheme="teal"
                size="sm"
                mt="2"
                onClick={addProductToUpdateDetails}
              >
                Thêm sản phẩm
              </Button>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpdateDetails}>
              Cập nhật
            </Button>
            <Button variant="ghost" onClick={onUpdateDetailsClose}>
              Hủy
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Order Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Chi tiết đơn hàng</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {detailsLoading ? (
              <Text>Đang tải...</Text>
            ) : orderDetails ? (
              <Box>
                <Text><strong>ID Đơn hàng:</strong> {orderDetails.orderId}</Text>
                <Text><strong>Loại:</strong> {orderDetails.type}</Text>
                <Text><strong>Trạng thái:</strong> {orderDetails.status}</Text>
                <Text><strong>Thời gian tạo:</strong> {new Date(orderDetails.createdTime).toLocaleString()}</Text>
                <Text><strong>Thời gian cập nhật:</strong> {new Date(orderDetails.updatedTime).toLocaleString()}</Text>
                <Text><strong>Người tạo:</strong> {orderDetails.createdBy}</Text>
                <Text><strong>Người cập nhật:</strong> {orderDetails.updatedBy}</Text>
                <Text><strong>Kho nguồn:</strong> {orderDetails.sourceWarehouseId || "N/A"}</Text>
                <Text><strong>Kho đích:</strong> {orderDetails.destinationWarehouseId || "N/A"}</Text>
                <Text><strong>Khách hàng:</strong> {orderDetails.customerId}</Text>
                <Text mt="4" fontWeight="bold">Chi tiết sản phẩm:</Text>
                {orderDetails.details.length > 0 ? (
                  <Table variant="simple" size="sm" mt="2">
                    <Thead>
                      <Tr>
                        <Th>Sản phẩm</Th>
                        <Th>Số lượng</Th>
                        <Th>Đơn vị</Th>
                        <Th>Giá</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {orderDetails.details.map((detail, index) => (
                        <Tr key={index}>
                          <Td>{detail.productName}</Td>
                          <Td>{detail.quantity}</Td>
                          <Td>{detail.productUnit}</Td>
                          <Td>{detail.price}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text>Không có chi tiết sản phẩm</Text>
                )}
              </Box>
            ) : (
              <Text>Không tìm thấy thông tin đơn hàng</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onDetailsClose}>
              Đóng
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}