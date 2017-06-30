/* *
 * DiscoBot - Gaymers Discord Bot
 * Copyright (C) 2015 - 2017 DiscoBot Authors
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 * */

const minecraft = require('../api/minecraft');

module.exports = {
  usage: '',
  description: 'Removes whitelists of a user for the Minecraft server.',
  allowDM: false,
  process: (bot, message) => {

    // Call database check for existance of users_minecraft entry
    minecraft.check(message.author, function(result) {
      if (result){
        // Fire register to database module
        minecraft.deregister(message.author, function(result){
          if (result){
            message.channel.send(message.author + ', You have been deregistered from our minecraft server :ok_hand:');
            // TODO: Fire RCON module surpassing admin
          }
          else {
            message.channel.send(message.author + ', Sorry there was an issue processing your deregistration :cry:');
          }
        });
      }
      else{
        message.channel.send(message.author + ', You are not registered with the minecraft server, if you wish to register please use `!minecraft_register username` first :ok_hand:');
      }
    });
  }
};
