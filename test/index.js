/* eslint-env mocha */
var assert = require('assert');
var helpers = require('../');

describe('getIncluded', function() {
  it('should throw an exception for missing includes', function() {
    var payload = {
      included: []
    };
    var ret = helpers.getIncluded(payload, 'tests', 'test-id');

    assert(!ret);
  });

  it('should return the included object', function() {
    var payload = {
      included: [
        {type: 'tests', id: 'test-id'}
      ]
    };

    var ret = helpers.getIncluded(payload, 'tests', 'test-id');

    assert.equal(ret.type, 'tests');
    assert.equal(ret.id, 'test-id');
  });
});

describe('getRelationship', function() {
  var payload = {
    included: [
      {type: 'tests', id: 'test-id1'},
      {type: 'tests', id: 'test-id2'},
      {type: 'ankhs', id: 'ankh-1'}
    ]
  };
  it('should get a singular relationship', function() {
    var resource = {
      relationships: {
        test: {
          data: {type: 'tests', id: 'test-id1'}
        }
      }
    };

    var rel = helpers.getRelationship(payload, resource, 'test');

    assert.equal(rel.type, 'tests');
    assert.equal(rel.id, 'test-id1');
  });

  it('should get plural relationships', function() {
    var resource = {
      relationships: {
        tests: {
          data: [
            {type: 'tests', id: 'test-id1'},
            {type: 'tests', id: 'test-id2'}
          ]
        }
      }
    };

    var rel = helpers.getRelationship(payload, resource, 'tests');

    assert.equal(rel.length, 2);
    assert.equal(rel[0].type, 'tests');
    assert.equal(rel[1].type, 'tests');
  });
});

describe('getRelationships', function() {
  var payload = {
    included: [
      {type: 'cats', id: '1', name: 'kitty'},
      {type: 'dogs', id: '2', name: 'sam'}
    ]
  };
  it('should get a set of relationships', function() {
    var resource = {
      relationships: {
        cat: {
          data: {type: 'cats', id: '1'}
        },
        dog: {
          data: {type: 'dogs', id: '2'}
        }
      }
    };

    var rels = helpers.getRelationships(payload, resource);

    assert.equal(rels.cat.name, 'kitty');
    assert.equal(rels.dog.name, 'sam');
  });
});

describe('getDeepRelationship', function() {
  var payload = {
    included: [
      {type: 'cats', id: '1', name: 'kitty',
        relationships: {
          bird: {
            data: {type: 'birds', id: '2'}
          }
        }
      },
      {type: 'birds', id: '2', name: 'jay',
        relationships: {
          worm: {
            data: {type: 'worms', id: '3'}
          }
        }
      },
      {type: 'worms', id: '3', name: 'jim'},
      {type: 'cats', id: '4', name: 'furball'}
    ]
  };
  it('should get a deeply nested of relationship', function() {
    var resource = {
      relationships: {
        cat: {
          data: {type: 'cats', id: '1'}
        }
      }
    };

    var rel = helpers.getDeepRelationship(payload, resource, 'cat.bird.worm');

    assert.equal(rel.name, 'jim');
  });
  it('should get undefined for non-existent relationship', function() {
    var resource = {
      relationships: {
        cat: {
          data: {type: 'cats', id: '1'}
        }
      }
    };

    var rel = helpers.getDeepRelationship(payload, resource, 'cat.dog');

    assert(!rel);
  });
  it('should handle deeply nested plural relationships', function() {
    var resource = {
      relationships: {
        cat: {
          data: [
            {type: 'cats', id: '1'},
            {type: 'cats', id: '4'}
          ]
        }
      }
    };

    var rel = helpers.getDeepRelationship(payload, resource, 'cat.bird.worm');

    assert.equal(rel.length, 2);
    assert.equal(rel[0].name, 'jim');
    assert.equal(rel[1], undefined);
  });
});
