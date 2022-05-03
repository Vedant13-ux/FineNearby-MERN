const db = require('./models/index');
const { off } = require('./models/user');

async function seedDB() {
    hotel_data = [
        {
            name: "Hotel Taj",
            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mumbai_Aug_2018_%2843397784544%29.jpg/375px-Mumbai_Aug_2018_%2843397784544%29.jpg",
            address: {
                street: "Lorem Ipsum",
                city: "Mumbai",
                state: "Maharashtra",
                zip: "400005"
            },
            services: [
                {
                    name: "Bus",
                    description: "Lorem Ipsum akhjsdjka jshdg jhasdasd",
                    price: 500,
                },
                {
                    name: "Dining",
                    description: "Lorem Ipsum akhjsdjka jshdg jhasdasd",
                    price: 500,
                }
            ]
        }
    ]

    hotel_data.forEach(async (hotel) => {
        var services = hotel.services;
        hotel.services = []
        db.Hotel.create(hotel)
            .then(hotel => {
                services.forEach(service => {
                    db.Service.create({
                        name: service.name,
                        description: service.description,
                        price: service.price,
                        hotel: hotel._id
                    })
                        .then(service => {
                            hotel.services.push(service._id)
                            hotel.save()

                        })
                        .catch(err => {
                            console.log(err)
                        })
                })
            })
            .catch(err => {
                console.log(err)
            })
    })

}

module.exports = seedDB;
