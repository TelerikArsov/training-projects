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
        },
        public: {

        }
    },
    root: {
        prefix:'/',
        get: {
            root: '/',
            catalog: '/catalog',
            orders: '/orders',
            cart: '/catalog/getCart',
            orders: '/orders/getOrders',
            order: '/orders/getOrder/:id'
        },
        post: {
            catalog: '/catalog',
            addToCart: '/catalog/addToCart',
            cartChangeQuantity: '/catalog/cartChangeQuantity',
            deleteCartItem: '/catalog/deleteCartItem',
            rateProduct: '/catalog/rateProduct',
            createOrder: '/catalog/createOrder'
        },
        public: {

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
        },
        public: {

        }
    }

}