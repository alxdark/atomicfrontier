# Atomic Frontier
A procedural content generation library for the Atomic Frontier set of post-apocalyptic games

[![Build Status](https://travis-ci.org/alxdark/atomicfrontier.svg?branch=master)](https://travis-ci.org/alxdark/atomicfrontier)

This project re-organizes a few other projects:

* ionosphere and the atomic package in ionosphere are organized into one NPM module
* some compression achieved with kibble (a Rails content management app) will be dropped in favor of managing data in this application

This will be a one-stop npm module to import into a browserify/webpack applications. This comes at the cost of a larger overall file size.

# What this library offers

Post-apocalyptic content for any pen-and-paper game set in the American west. The intent is to be rules agnostic; I have a couple of different pen-and-paper games in design that use this generator. Also useful for Gamma World, Apocalypse World, Darwin's World, anything related to the Fallout video game series, etc.

# API

Currently documented through yuidocs (npm run docs).
