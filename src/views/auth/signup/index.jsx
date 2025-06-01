import React, { useState } from "react";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import axios from "api/axios"

function SignUp() {
    const textColor = useColorModeValue("navy.700", "white");
    const textColorSecondary = "gray.400";
    const textColorBrand = useColorModeValue("brand.500", "white");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        phone: "",
        branchId: "HN",
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async () => {
        const payload = {
            ...formData,
            role: 2, // set cứng
            dbType: formData.branchId, // set theo branchId
            dob: new Date().toISOString().split("T")[0], // yyyy-mm-dd
        };

        try {
            const res = await axios.post("/v1/users/", payload);
            alert("Tạo tài khoản thành công!");
            console.log(res.data);
        } catch (error) {
            console.error("Error during sign up:", error);
            alert("Đăng ký thất bại.");
        }
    };

    return (
        <DefaultAuth illustrationBackground={illustration} image={illustration}>
            <Flex
                maxW="100%"
                w="100%"
                mx="auto"
                h="auto" // ✅ chiều cao tự động
                alignItems="flex-start" // ✅ canh trái
                justifyContent="flex-start"
                mt={{ base: "40px", md: "14vh" }}
                px={{ base: 4, md: 16 }} // ✅ thêm padding ngang
                pb="100px" // ✅ tránh đè footer
                flexDirection="column"
            >
                <Box mb="36px">
                    <Heading color={textColor} fontSize="36px" mb="10px">
                        Sign Up
                    </Heading>
                    <Text color={textColorSecondary} fontWeight="400" fontSize="md">
                        Create your account by filling out the information below
                    </Text>
                </Box>

                <Box w={{ base: "100%", md: "420px" }}>
                    {["name", "email", "password", "address", "phone", "branchId"].map((field) => (
                        <FormControl key={field} mb="20px">
                            <FormLabel color={textColor} textTransform="capitalize">
                                {field}
                            </FormLabel>
                            <Input
                                type={field === "password" ? "password" : "text"}
                                name={field}
                                value={formData[field]}
                                onChange={handleChange}
                                placeholder={field}
                            />
                        </FormControl>
                    ))}

                    <Button
                        fontSize="sm"
                        variant="brand"
                        fontWeight="500"
                        w="100%"
                        h="50"
                        onClick={handleSubmit}
                    >
                        Sign Up
                    </Button>

                    <Text color={textColorSecondary} mt="10px">
                        Already have an account?{" "}
                        <NavLink to="/auth/sign-in">
                            <Text color={textColorBrand} as="span">
                                Sign In
                            </Text>
                        </NavLink>
                    </Text>
                </Box>
            </Flex>
        </DefaultAuth>

    );
}

export default SignUp;
