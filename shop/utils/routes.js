exports.routes = {
    admin: {
        prefix: '/admin',
        get: {
            root: '/',
            account: '/account',
            login: '/login',
            createWorker: '/create/worker',
            create: '/create',
            allOrders: '/orders/getOrders',
            order: '/orders/',
            orderById: '/orders/getOrder/:id',
            allInTable: '/getAll/:table'
        },
        post: {
            account: '/account',
            login: '/login',
            logout: '/logout',
            deleteTable: '/delete/:table',
            editTable: '/edit/:table',
            createTable: '/create/:table',
            uploadImage: '/upload/image',
            productAmmount:'/product/ammount',
            productAddTag: '/product/addTag',
            productRemoveTag: '/product/removeTag'
        }
    },
    root: {
        prefix:'/',
        get: {
            root: '/',
            catalog: '/catalog',
            orders: '/orders',
            cart: '/catalog/getCart',
            ordersTable: '/orders/getOrders',
            order: '/orders/getOrder/:id'
        },
        post: {
            catalog: '/catalog',
            addToCart: '/catalog/addToCart',
            cartChangeQuantity: '/catalog/cartChangeQuantity',
            deleteCartItem: '/catalog/deleteCartItem',
            rateProduct: '/catalog/rateProduct',
            createOrder: '/catalog/createOrder'
        }
    },
    user: {
        prefix: '/user',
        get: {
            root: '/',
            register: '/register',
            login: '/login',
            confirmationToken: '/confirmation/:token'
        },
        post: {
            register: '/register',
            login: '/login',
            logout: '/logout',
            updateProfile: '/'
        }
    }

}

exports.publicRoutes = {
    admin: {
        // /admin/account
        editAccount: this.routes.admin.prefix + this.routes.admin.post.account,
        // "/admin/orders/getOrder/:id"
        orderById: this.routes.admin.prefix + this.routes.admin.orderById,
        //"/admin/orders/getOrders"
        allOrders: this.routes.admin.prefix + this.routes.admin.get.allOrders,
        //"/admin/orders"
        orderPage: this.routes.admin.prefix + this.routes.admin.get.order,
        // "/admin/create/worker"
        createWorkerPage: this.routes.admin.prefix + this.routes.admin.get.createWorker,
        //'/admin/create'
        createPage: this.routes.admin.prefix + this.routes.admin.get.create,
        //'/admin/logout/'
        logout: this.routes.admin.prefix + this.routes.admin.post.logout,
        create: this.routes.admin.prefix + this.routes.admin.post.createTable,
        delete: this.routes.admin.prefix + this.routes.admin.post.deleteTable,
        edit: this.routes.admin.prefix + this.routes.admin.post.editTable,
        productAmmount: this.routes.admin.prefix + this.routes.admin.post.productAmmount,
        uploadImage: this.routes.admin.prefix + this.routes.admin.post.uploadImage,
        addTag: this.routes.admin.prefix + this.routes.admin.post.productAddTag,
        removeTag: this.routes.admin.prefix + this.routes.admin.post.productRemoveTag,
        getAll: this.routes.admin.prefix + this.routes.admin.get.allInTable,
        login: this.routes.admin.prefix + this.routes.admin.post.login,
        register: this.routes.admin.prefix + this.routes.admin.post.register
    },
    root: {
        //"/catalog/createOrder"
        createOrder: this.routes.root.prefix + this.routes.root.post.createOrder,
        userCart: this.routes.root.prefix + this.routes.root.get.cart,
        addToCart: this.routes.root.prefix + this.routes.root.post.addToCart,
        deleteCartItem: this.routes.root.prefix + this.routes.root.post.deleteCartItem,
        cartChangeQuantity: this.routes.root.prefix + this.routes.root.post.cartChangeQuantity,
        rateProduct: this.routes.root.prefix + this.routes.root.post.rateProduct,
        filter: this.routes.root.prefix + this.routes.root.post.catalog,
        catalog: this.routes.root.prefix + this.routes.root.get.catalog,
        orders: this.routes.root.prefix + this.routes.root.get.orders,
        getOrderById: this.routes.root.prefix + this.routes.root.get.orderById,
        ordersForUser: this.routes.root.prefix + this.routes.root.get.ordersTable
    },
    user: {
        root: this.routes.user.prefix + this.routes.user.get.root,
        logout: this.routes.user.prefix + this.routes.user.post.logout,
        registerPage: this.routes.user.prefix + this.routes.user.get.register,
        loginPage: this.routes.user.prefix + this.routes.user.get.login,
        login: this.routes.user.prefix + this.routes.user.post.login,
        register: this.routes.user.prefix + this.routes.user.post.register
    }

}

exports.generateParamUrl = (url, params) => {
    //naive way for now
    for(const [paramName, paramValue] in Object.entries(params)){
        url = url.replace(':' + paramName, paramValue)
    }
}