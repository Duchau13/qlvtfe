import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Text,
  useColorModeValue,
  Stack,
  Alert,
  AlertIcon,
  Fade,
} from "@chakra-ui/react";
import { HSeparator } from "components/separator/Separator";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import axiosInstance from "api/axios";

function SignIn() {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");

  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [dbType, setDbType] = useState("HN");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await axiosInstance.post("/v1/users/sign-in", {
        userId,
        password,
        dbType,
      });

      const data = response.data;

      if (data.data?.accessToken?.token) {
        localStorage.setItem("accessToken", data.data.accessToken.token);
        localStorage.setItem("refreshToken", data.data.refreshToken.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        navigate("/admin/default");
      } else {
        setErrorMsg("Invalid login response");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "400px" }}
        w="100%"
        mx="auto"
        h="100%"
        alignItems="center"
        justifyContent="center"
        px={{ base: "20px", md: "0px" }}
        mt={{ base: "20px", md: "10vh" }}
        flexDirection="column"
      >
        <Box mb="20px" textAlign="center">
          <Heading color={textColor} fontSize={{ base: "28px", md: "32px" }} mb="8px">
            Sign In
          </Heading>
          <Text color={textColorSecondary} fontWeight="400" fontSize="sm">
            Enter your credentials to access your account
          </Text>
        </Box>
        <Stack
          as="form"
          onSubmit={handleSubmit}
          spacing="16px"
          w="100%"
          maxW="100%"
          bg="transparent"
          borderRadius="15px"
          p="20px"
          boxShadow="lg"
        >
          <FormControl isRequired>
            <FormLabel
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              User ID <Text as="span" color={brandStars}>*</Text>
            </FormLabel>
            <Input
              variant="auth"
              fontSize="sm"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              size="lg"
              transition="all 0.2s"
              _focus={{ boxShadow: "outline", borderColor: textColorBrand }}
              aria-label="User ID"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Password <Text as="span" color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size="lg">
              <Input
                fontSize="sm"
                placeholder="Min. 8 characters"
                type={show ? "text" : "password"}
                variant="auth"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                transition="all 0.2s"
                _focus={{ boxShadow: "outline", borderColor: textColorBrand }}
                aria-label="Password"
              />
              <InputRightElement display="flex" alignItems="center">
                <Icon
                  color={textColorSecondary}
                  _hover={{ cursor: "pointer" }}
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleClick}
                  aria-label={show ? "Hide password" : "Show password"}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel
              fontSize="sm"
              fontWeight="500"
              color={textColor}
              mb="8px"
            >
              Area <Text as="span" color={brandStars}>*</Text>
            </FormLabel>
            <Select
              variant="auth"
              size="lg"
              value={dbType}
              onChange={(e) => setDbType(e.target.value)}
              transition="all 0.2s"
              _focus={{ boxShadow: "outline", borderColor: textColorBrand }}
              aria-label="Select area"
            >
              <option value="HN">HN</option>
              <option value="HCM">HCM</option>
            </Select>
          </FormControl>

          {errorMsg && (
            <Fade in={errorMsg}>
              <Alert status="error" borderRadius="md" fontSize="sm">
                <AlertIcon />
                {errorMsg}
              </Alert>
            </Fade>
          )}

          <Flex justifyContent="space-between" align="center">
            <FormControl display="flex" alignItems="center">
              <Checkbox id="remember-login" colorScheme="brand" mr="8px" />
              <FormLabel
                htmlFor="remember-login"
                mb="0"
                fontWeight="normal"
                color={textColor}
                fontSize="sm"
              >
                Keep me logged in
              </FormLabel>
            </FormControl>
            <NavLink to="/auth/forgot-password">
              <Text
                color={textColorBrand}
                fontSize="sm"
                fontWeight="500"
                _hover={{ textDecoration: "underline" }}
              >
                Forgot password?
              </Text>
            </NavLink>
          </Flex>

          <Button
            fontSize="sm"
            variant="brand"
            fontWeight="500"
            w="100%"
            h="50px"
            type="submit"
            isLoading={loading}
            loadingText="Signing In"
            _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
          >
            Sign In
          </Button>

          <Text color={textColorSecondary} fontWeight="400" fontSize="sm" textAlign="center">
            Not registered yet?{" "}
            <NavLink to="/auth/sign-up">
              <Text as="span" color={textColorBrand} fontWeight="500" _hover={{ textDecoration: "underline" }}>
                Create an Account
              </Text>
            </NavLink>
          </Text>
        </Stack>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;