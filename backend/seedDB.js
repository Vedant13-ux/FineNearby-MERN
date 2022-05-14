const db = require('./models/index');

hotel_data = [
    {
        "name": "Hotel Taj",
        "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mumbai_Aug_2018_%2843397784544%29.jpg/375px-Mumbai_Aug_2018_%2843397784544%29.jpg",
        "address": {
            "street": "Lorem Ipsum",
            "city": "Mumbai",
            "state": "Maharashtra",
            "zip": "400005"
        },
        "services": [
            {
                "name": "Bus",
                "description": "Lorem Ipsum akhjsdjka jshdg jhasdasd",
                "price": 500
            },
            {
                "name": "Dining",
                "description": "Lorem Ipsum akhjsdjka jshdg jhasdasd",
                "price": 50
            },
            {
                "name": "Taxi",
                "description": "Lorem Ipsum akhjsdjka jshdg jhasdasd",
                "price": 300
            },
            {
                "name": "Self Care & Spa",
                "description": "Lorem Ipsum akhjsdjka jshdg jhasdasd",
                "price": 200
            },
            {
                "name": "Swimming Pool",
                "description": "Lorem Ipsum akhjsdjka jshdg jhasdasd",
                "price": 1000
            },
            {
                "name": "Games & Entertainment",
                "description": "Lorem Ipsum akhjsdjka jshdg jhasdasd",
                "price": 100
            }

        ]
    },

    post_data = [
        {
            "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit",
            "image": "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aG90ZWxzfGVufDB8fDB8fA%3D%3D&w=1000&q=80",
            "author": "62729e014533fff6509bdaa4",
            "hotel": "627270431e03598840498dd1"

        }
    ]
]
