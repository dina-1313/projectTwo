import user from "../fixtures/user.json";
import post from "../fixtures/post.json";
import { faker } from '@faker-js/faker';

user.email = faker.internet.email({ provider: 'testmail.com' });

post.userId = faker.number.int({ min: 1000, max: 3000 });
post.id = faker.number.int({ min: 4000, max: 5000 });
post.title = faker.person.firstName();
post.body = faker.person.lastName()

it('1 - Get all posts', () => {
    cy.request({
        method: "GET",
        url: "/posts",
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.headers["content-type"]).to.eq('application/json; charset=utf-8');
        console.log("response.status: " + JSON.stringify(response.headers));
    })
})


it('2 - Get 10 first posts', () => {
    cy.request({
        method: "GET",
        url: "/posts?id=1&id=2&id=3&id=4&id=5&id=6&id=7&id=8&id=9&id=10",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        expect(response.status).to.eq(200);
        const postIds = response.body.map(post => post.id);
        expect(response.body).to.have.lengthOf(10)
        expect(postIds).to.deep.eq([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        console.log(postIds);
    })
})


it('3 - Get posts with id = 55 and id = 60', () => {
    const postIds = [55, 60];
    postIds.forEach(postId => {
        cy.request({
            method: "GET",
            url: `/posts/${postId}`
        }).then(response => {
            expect(response.status).to.eq(200);
            expect(response.body.id).to.eq(postId);
            console.log(JSON.stringify(response.body.id));
        });
    });
})


it('4 - Create a post. Verify HTTP response status code.', () => {
    cy.request({
        method: 'POST',
        url: '/664/posts',
        failOnStatusCode: false,
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(response => {
        expect(response.status).to.eq(401);
    })
})



it('5 - Create post with adding access token in header', () => {

    let token;
    let userId;

    cy.request({
        method: 'POST',
        url: '/register',
        body: user,
    }).then(response => {
        expect(response.status).to.eq(201);
        token = response.body.accessToken;
    }).then(() => {
        cy.request({
            method: 'POST',
            url: '/664/posts',
            body: user,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            expect(response.status).to.eq(201);
            userId = response.body.id
        }).then(() => {
            cy.request({
                method: 'GET',
                url: `/664/posts/${userId}`
            }).then(response => {
                expect(response.status).to.eq(200);
                expect(response.body.id).to.eq(userId);
            })
        })
    })
})


it('6 - Create post entity and verify that the entity is created. Use JSON in body.', () => {
    cy.request({
        method: 'POST',
        url: '/posts',
        body: JSON.stringify(post),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        expect(response.status).to.eq(201);
        expect(response.body).to.contain(post);
    })
})


it('7 - Update non-existing entity', () => {
    cy.request({
        method: 'PUT',
        url: '/posts',
        failOnStatusCode: false,
        body: post,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        expect(response.status).to.eq(404);
    })
})


it('8 - Create post entity and update the created entity', () => {

    let postId;
    let newTitle;
    let oldTitle;
    post.id = faker.number.int({ min: 5000, max: 6000 });

    cy.request({
        method: 'POST',
        url: '/posts',
        body: post,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        expect(response.status).to.eq(201);
        expect(response.body).to.contain(post);
        postId = response.body.id
        oldTitle = response.body.title;
    }).then(() => {
        post.title = faker.person.gender();
        cy.request({
            method: 'PUT',
            url: `/posts/${postId}`,
            body: post,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            expect(response.status).to.eq(200);
            newTitle = response.body.title;
            expect(response.body.title).eq(newTitle)
            expect(oldTitle).to.not.eq(newTitle);
        })
    })
})


it('9 - Delete non-existing entity', () => {
    cy.request({
        method: 'DELETE',
        url: '/posts',
        failOnStatusCode: false,
        body: post,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        expect(response.status).to.eq(404);
    })
})

it('10 - Create post entity, update the created entity, and delete the entity', () => {

    let postId;
    let newTitle;
    let oldTitle
    post.id = faker.number.int({ min: 6000, max: 7000 });

    cy.request({
        method: 'POST',
        url: '/posts',
        body: post,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        expect(response.status).to.eq(201);
        expect(response.body).to.contain(post);
        postId = response.body.id
        oldTitle = response.body.title;
    }).then(() => {
        post.title = faker.person.gender();
        cy.request({
            method: 'PUT',
            url: `/posts/${postId}`,
            body: post,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            expect(response.status).to.eq(200);
            newTitle = response.body.title;
            expect(response.body.title).eq(newTitle)
            expect(oldTitle).to.not.eq(newTitle);
        }).then(() => {

            cy.request({
                method: 'DELETE',
                url: `/posts/${postId}`,
                body: post,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                expect(response.status).to.eq(200);
                expect(response.body.post).to.be.undefined;
            })
        })
    })
})



