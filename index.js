/**
 * Fetches an included object from a payload by its id
 *
 * @param {Object} payload
 *   The payload encapsulating the included data
 * @param {String} type
 *   The entity type to retrieve
 * @param {String} id
 *   The id of the desired included data
 *
 * @return {Object}
 *   The found included data
 */
function getIncluded(payload, type, id) {
  for (var i = payload.included.length - 1; i >= 0; i--) {
    if (payload.included[i].id === id && payload.included[i].type === type) {
      return payload.included[i];
    }
  }
}
exports.getIncluded = getIncluded;

/**
 * Fetches specified included data associated to a resource
 *
 * @param {Object} payload
 *   The payload encapsulating the included data
 * @param {Object} resource
 *   The resource to find included data for
 * @param {String} key
 *   The relationship to included data to retrieve
 *
 * @return {Object|Array|undefined}
 *   The found included data object
 *   The found included data objects
 *   Or, undefined if the requested included data is not part of the API response
 */
function getRelationship(payload, resource, key) {
  var relationships = resource.relationships && resource.relationships[key];
  if (!relationships || !relationships.data) {
    return;
  }
  return !Array.isArray(relationships.data)
    ? getIncluded(payload, relationships.data.type, relationships.data.id)
    : relationships.data.map(function (relationship) {
      return getIncluded(payload, relationship.type, relationship.id);
    });
}
exports.getRelationship = getRelationship;

/**
 * Fetches specified included data associated to a resource
 *
 * @param {Object} payload
 *   The payload encapsulating the included data
 * @param {Object} resource
 *   The resource to find included data for
 *
 * @return {Object}
 *   The found included data object(s) keyed by relationships
 */
function getRelationships(payload, resource) {
  var result = {};
  for (var key in resource.relationships) {
    result[key] = getRelationship(payload, resource, key);
  }
  return result;
}
exports.getRelationships = getRelationships;

/**
 * Fetches specified related data associated to a resource,
 *   and related data assocociated to that included resource...
 *
 * @param {Object} payload
 *   The payload encapsulating the included data
 * @param {Object} parentResource
 *   The first resource to find included data for
 * @param {String} deepKey
 *   The relationship to included data to retrieve, delimited by periods.
 *
 * @return {Array|Object|undefined}
 *   The found included data object(s) or undefined if the requested included
 *   data is not part of the API response
 */
function getDeepRelationship(payload, parentResource, deepKey) {
  var path = deepKey.split('.');
  var subResources = parentResource;
  for (var i = 0; i < path.length; i++) {
    if (Array.isArray(subResources)) {
      subResources = subResources.map(function (subResource) {
        return subResource && getRelationship(payload, subResource, path[i]);
      });
    }
    else {
      subResources = subResources && getRelationship(payload, subResources, path[i]);
    }
  }
  return subResources;
}
exports.getDeepRelationship = getDeepRelationship;
