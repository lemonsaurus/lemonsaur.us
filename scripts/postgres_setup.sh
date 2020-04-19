#!/usr/bin/env bash
# NOTE: this only works for systems that use apt as their package manager
echo "Installing PostgreSQL and configuring it for use."

# Install postgres
echo "-- INSTALLING POSTGRESQL --"
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create a user and a database in postgres
echo "-- POSTGRESQL INIT --"
sudo -u postgres createuser lemonsaurus
sudo -u postgres createdb lemonsaurus

# Add the user to linux
echo "-- CREATING LEMONSAURUS LINUX USER --"
sudo useradd --no-create-home lemonsaurus

# Installation complete!
echo "-- CONFIGURATION COMPLETE --"
