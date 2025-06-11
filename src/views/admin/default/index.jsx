import {
  Avatar,
  Box,
  Flex,
  FormLabel,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  useDisclosure,
} from "@chakra-ui/react";

import React, { useState, useEffect } from "react";
import {
 
  MdAdd,
} from "react-icons/md";

import {
  columnsDataCheck,
  columnsDataComplex,
} from "views/admin/default/variables/columnsData";

import axiosInstance from "api/axios";

export default function UserReports() {
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const tableBg = useColorModeValue("white", "gray.800");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Create modal state
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const [createForm, setCreateForm] = useState({ name: "", unit: "" });

  // Delete confirmation modal state
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteProductId, setDeleteProductId] = useState(null);

  // Update modal state
  const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure();
  const [updateForm, setUpdateForm] = useState({ productId: null, name: "" });

  // Get accessToken and dbType from localStorage
  const accessToken = localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const dbType = user.branchId || "HN";

  useEffect(() => {
    // Fetch products from API
    const fetchProducts = async () => {
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
        const response = await axiosInstance.get(`/v1/products/?dbType=${dbType}`);
        console.log("API Response:", response.data);

        // Ensure response.data.data is an array, otherwise set to empty array
        const productData = Array.isArray(response.data.data) ? response.data.data : [];
        setProducts(productData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi gọi API:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        toast({
          title: "Lỗi khi lấy danh sách sản phẩm",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
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

    if (!createForm.name || !createForm.unit) {
      toast({
        title: "Lỗi nhập liệu",
        description: "Vui lòng điền đầy đủ tên sản phẩm và đơn vị.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axiosInstance.post("/v1/products/", {
        name: createForm.name,
        unit: createForm.unit,
      });
      setProducts([...products, response.data.data]);
      toast({
        title: "Đã tạo sản phẩm",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setCreateForm({ name: "", unit: "" });
      onCreateClose();
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi tạo sản phẩm",
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
      await axiosInstance.delete(`/v1/products/${deleteProductId}`);
      setProducts(products.filter((product) => product.productId !== deleteProductId));
      toast({
        title: "Đã xóa sản phẩm",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDeleteClose();
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi xóa sản phẩm",
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

    if (!updateForm.name) {
      toast({
        title: "Lỗi nhập liệu",
        description: "Vui lòng điền tên sản phẩm.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await axiosInstance.put(`/v1/products/${updateForm.productId}`, {
        name: updateForm.name,
      });
      setProducts(
        products.map((product) =>
          product.productId === updateForm.productId
            ? { ...product, name: updateForm.name }
            : product
        )
      );
      toast({
        title: "Đã cập nhật sản phẩm",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setUpdateForm({ productId: null, name: "" });
      onUpdateClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
        title: "Lỗi khi cập nhật sản phẩm",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open update modal with pre-filled data
  const openUpdateModal = (product) => {
    setUpdateForm({ productId: product.productId, name: product.name });
    onUpdateOpen();
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="20px" mb="20px">
        {/* Existing MiniStatistics components can be added here */}
      </SimpleGrid>

      <Box>
        {/* Header with Create Button */}
        <Flex justify="flex-end" align="center" mb="4">
          <Button
            leftIcon={<MdAdd />}
            colorScheme="teal"
            onClick={onCreateOpen}
          >
            Tạo sản phẩm
          </Button>
        </Flex>

        {/* Products Table */}
        <Box bg={tableBg} borderRadius="md" boxShadow="md" p="4">
          <Table variant="simple" colorScheme="teal">
            <Thead bg={brandColor} color="white">
              <Tr>
                <Th color="white">ID</Th>
                <Th color="white">Tên</Th>
                <Th color="white">Đơn vị</Th>
                <Th color="white">Thời gian tạo</Th>
                <Th color="white">Số lượng nhập</Th>
                <Th color="white">Số lượng xuất</Th>
                <Th color="white">Tồn kho</Th>
                <Th color="white">Hành động</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={8} textAlign="center">
                    Đang tải...
                  </Td>
                </Tr>
              ) : products.length === 0 ? (
                <Tr>
                  <Td colSpan={8} textAlign="center">
                    Không tìm thấy sản phẩm
                  </Td>
                </Tr>
              ) : (
                products.map((product) => (
                  <Tr key={product.productId} _hover={{ bg: boxBg }}>
                    <Td>{product.productId}</Td>
                    <Td>{product.name}</Td>
                    <Td>{product.unit}</Td>
                    <Td>{new Date(product.createdTime).toLocaleString()}</Td>
                    <Td>{product.importQuantity}</Td>
                    <Td>{product.exportQuantity}</Td>
                    <Td>{product.quantity}</Td>
                    <Td>
                      <Flex gap="2">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => openUpdateModal(product)}
                        >
                          Cập nhật
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          onClick={() => {
                            setDeleteProductId(product.productId);
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

        {/* Create Product Modal */}
        <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Tạo sản phẩm mới</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl mb="4">
                <FormLabel>Tên sản phẩm</FormLabel>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Đơn vị</FormLabel>
                <Input
                  value={createForm.unit}
                  onChange={(e) => setCreateForm({ ...createForm, unit: e.target.value })}
                  placeholder="Nhập đơn vị (ví dụ: KG)"
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

        {/* Delete Confirmation Modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Xác nhận xóa</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Bạn có chắc chắn muốn xóa sản phẩm này?
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

        {/* Update Product Modal */}
        <Modal isOpen={isUpdateOpen} onClose={onUpdateClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Cập nhật sản phẩm</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Tên sản phẩm</FormLabel>
                <Input
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm"
                />
              </FormControl>
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
      </Box>
    </Box>
  );
}