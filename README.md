## JSON API Relate

[![npm version](https://badge.fury.io/js/jsonapi-relate.svg)](http://badge.fury.io/js/jsonapi-relate)
[![Build Status](https://travis-ci.org/highly-attractive-people/jsonapi-relate.svg)](https://travis-ci.org/highly-attractive-people/jsonapi-relate)
[![Coverage Status](https://coveralls.io/repos/highly-attractive-people/jsonapi-relate/badge.svg)](https://coveralls.io/r/highly-attractive-people/jsonapi-relate)

This library provides several helper methods for navigating [JSON API](http://jsonapi.org) payloads

### Get a Relationship

For starters, let's take the official example: getting articles from a blog.

Let's say you just want to clean up that up into something usable for your template.

```js
MyAPI.get("/articles").then(function (payload) {
  return payload.data.map(function (article) {
    var author = payload.included.find(function(include) {
      return include.id === article.relationships.author.data.id
        && include.type === article.relationships.author.data.type
    })
    return {
      title: article.attributes.title,
      author: author && author.attributes,
      comments: article.relationships.comments.data.map(function (relationship, i) {
        var comment = payload.included.find(function(include) {
          return include.id === relationship.id
            && include.type === relationship.type
        })
        var author = payload.included.find(function(include) {
          return include.id === comment.relationships.author.data.id
            && include.type === comment.relationships.author.data.type
        })
        return {
          body: comment.attributes.body,
          author: author && author.attributes
        }
      })
    }
  })
})
```

That works, but it's messy and hard to follow.. this is where `relate` helps you out. Notice `getRelationship` deals with singular, or plural relationships just fine.

```js
var relate = require("jsonapi-relate")
MyAPI.get("/articles").then(function (payload) {
  return payload.data.map(function (article) {
    var author = relate.getRelationship(payload, article, "author")
    return {
      title: article.attributes.title,
      author: author && author.attributes,
      comments: relate.getRelationship(payload, article, "comments")
        .map(function(comment) {
          var author = relate.getRelationship(payload, comment, "author")
          return {
            body: comment.attributes.body,
            author: author && author.attributes
          }
        })
    }
  })
})
```

We've also got a few more helpers...

### Get all Relationships

Sometimes you have a lot of relationships, and you want to get them all. Let's update our first example above to get author and comments at once.

```js
var relate = require("jsonapi-relate")
MyAPI.get("/articles").then(function (payload) {
  return payload.data.map(function (article) {
    var relationships = relate.getRelationships(payload, article)
    return {
      title: article.attributes.title,
      author: relationships.author && relationships.author.attributes,
      comments: relationships.comments
        .map(function(comment) {
          var author = relate.getRelationship(payload, comment, "author")
          return {
            body: comment.attributes.body,
            author: author && author.attributes
          }
        })
    }
  })
})
```

### Get deep Relationships

Using our first example. Let's say that I just want to get Comment authors, and don't care about the comments themselves. Now, I'll need to traverse through two relationships.

```js
var relate = require("jsonapi-relate")
MyAPI.get("/articles").then(function (payload) {
  return payload.data.map(function (article) {
    var author = relate.getRelationship(payload, article, "author")
    return {
      title: article.attributes.title,
      author: author && author.attributes,
      commentAuthors: relate.getDeepRelationship(payload, article, "comments.author")
        .filter(function(author) {
          return author
        })
        .attributes
      }
    }
  })
})
```

## Installation
```
npm install jsonapi-relate --save
```

## Development
### Testing
Using Mocha/Chai for testing.
```
npm t
```

### Code Coverage
Generate a report using Istanbul to make sure your tests are touching everything!
```
npm t && npm run view-coverage
```
