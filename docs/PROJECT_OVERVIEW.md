# Project Overview

## Problem

News feeds are often broad and difficult to adapt to an individual reader's interests and languages.

## Product goal

myNews is a mobile-first application that lets a reader select topics, content languages and optional keywords, then consult recent personalized articles from original publishers.

## Audience and value

The MVP targets readers who want a focused, understandable news experience without social features, opaque ranking or full-text article copying. It also serves as a portfolio project built with standard React Native and Express practices.

## General architecture

The Expo mobile app communicates with an Express REST API. Better Auth owns authentication and sessions; MongoDB stores durable preferences, articles and per-user article states; the backend alone calls TheNewsAPI and normalizes its response.

## Current state

The MVP supports email/password authentication, onboarding, preference editing, a seven-day personalized feed with manual pagination, article opening, Favorite, Read / Unread and Saved. Native production packaging and deployment remain future work.
