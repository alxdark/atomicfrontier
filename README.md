# Atomic Frontier
A procedural content generation library for the Atomic Frontier set of post-apocalyptic games

[![Build Status](https://travis-ci.org/alxdark/atomicfrontier.svg?branch=master)](https://travis-ci.org/alxdark/atomicfrontier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

(Commitizen set up to use the [AngularJS commit guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#-git-commit-guidelines "AngularJS commit guidelines"))

This project re-organizes a few other projects:

* ionosphere and the atomic package in ionosphere are organized into one NPM module
* some compression achieved with kibble (a Rails content management app) will be dropped in favor of managing data in this application

In short, this will be a one-stop npm module to import into a browserify/webpack application. This comes at the cost of a larger overall file size.

# API
Currently documented through yuidocs (npm docs).
