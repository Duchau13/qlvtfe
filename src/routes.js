import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import Orders from 'views/admin/Orders';
import Profile from 'views/admin/profile';
import User from 'views/admin/User';
import RTL from 'views/admin/rtl';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUpCentered from 'views/auth/signup'; 
import Order from 'views/admin/Orders'; 
import Warehouses from 'views/admin/warehouse';
import Imports from 'views/admin/Imports';
import Exports from 'views/admin/export';
import Customers from 'views/admin/customer';

const routes = [
  {
    name: 'Product',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'Order',
    layout: '/admin',
    path: '/order',
    icon: (
      <Icon
        as={MdOutlineShoppingCart}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: <Orders />,
    secondary: true,
  },
  {
    name: 'User',
    layout: '/admin',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    path: '/user',
    component: <User />,
  },
  {
    name: 'WareHouse',
    layout: '/admin',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    path: '/warehouses',
    component: <Warehouses />,
  },
  
  {
    name: 'Import',
    layout: '/admin',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    path: '/import',
    component: <Imports/>,
  },
  {
    name: 'Export',
    layout: '/admin',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    path: '/exports',
    component: <Exports/>,
  },
  {
    name: 'Profile',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
  },
  
  {
    name: 'Customer',
    layout: '/admin',
    path: '/customer',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Customers />,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
  // {
  //   name: 'RTL Admin',
  //   layout: '/rtl',
  //   path: '/rtl-default',
  //   icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  //   component: <RTL />,
  // },
  // {
  //   name: 'Order',
  //   layout: '/auth',
  //   path: '/rtl-default',
  //   icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  //   component: <RTL />,
  // },
  // {
  //   layout: '/auth',
  //   path: '/sign-up',
  //   component: <SignUpCentered />,
  // },
];

export default routes;
