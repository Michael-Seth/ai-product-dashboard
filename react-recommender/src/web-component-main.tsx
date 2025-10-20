/**
 * Entry point for the Web Component version of the React Recommender
 * This file registers the custom element and makes it available for use in Angular
 */

import './web-component/index';
import './styles.css';

// The custom element is automatically registered when the web-component module is imported
// Angular can now use <react-recommender product="..."></react-recommender>

console.log('React Recommender Web Component registered as "react-recommender"');