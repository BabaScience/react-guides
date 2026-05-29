import React, { useState } from 'react';
import { View, Text, Image, Pressable, FlatList, StyleSheet } from 'react-native';

/**
 * MODULE RN-04: Core Components & APIs
 */

// ============================================
// EXERCISE 1: Profile Card
// ============================================

/**
 * OBJECTIVE: Build a profile card using View, Text, and Image.
 *
 * INSTRUCTIONS:
 * - Accept `name`, `role`, and `avatarUrl` props.
 * - Render the avatar as an Image with testID="avatar".
 * - Render the name in bold text with testID="name".
 * - Render the role in lighter text with testID="role".
 * - Wrap everything in a View with testID="profile-card".
 */

interface ProfileCardProps {
  name: string;
  role: string;
  avatarUrl: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ name, role, avatarUrl }) => {
  // TODO: Build a profile card with View, Text, and Image
  // Use the testID props listed in the instructions.
  return null;
};

// ============================================
// EXERCISE 2: Counter Button
// ============================================

/**
 * OBJECTIVE: Create a tappable counter using Pressable and Text.
 *
 * INSTRUCTIONS:
 * - Display the current count in a Text with testID="count".
 * - Format as "Count: {n}" (e.g. "Count: 0").
 * - Render a Pressable with testID="increment" that increments the count.
 * - Render a Pressable with testID="decrement" that decrements the count.
 * - The Pressable children must be Text components with labels "+" and "-".
 */

export const CounterButton: React.FC = () => {
  // TODO: Implement a counter with Pressable buttons
  return null;
};

// ============================================
// EXERCISE 3: Contact List
// ============================================

/**
 * OBJECTIVE: Render a list of contacts using FlatList.
 *
 * INSTRUCTIONS:
 * - Accept a `contacts` prop (array of { id, name, phone }).
 * - Use FlatList to render each contact.
 * - Each row should show the name and phone in Text components.
 * - Each row View should have testID={`contact-${contact.id}`}.
 * - The FlatList should have testID="contact-list".
 * - When the list is empty, render a Text with "No contacts" and testID="empty".
 */

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface ContactListProps {
  contacts: Contact[];
}

export const ContactList: React.FC<ContactListProps> = ({ contacts }) => {
  // TODO: Render contacts with FlatList
  return null;
};

// ============================================
// EXERCISE 4: Toggle Card
// ============================================

/**
 * OBJECTIVE: Build a card that expands/collapses on press.
 *
 * INSTRUCTIONS:
 * - Accept `title` and `content` props.
 * - Always show the title in a Pressable with testID="toggle-header".
 * - When pressed, toggle visibility of the content.
 * - Content should be in a View with testID="toggle-content" (only rendered when expanded).
 * - Start collapsed (content hidden).
 */

interface ToggleCardProps {
  title: string;
  content: string;
}

export const ToggleCard: React.FC<ToggleCardProps> = ({ title, content }) => {
  // TODO: Implement an expandable card
  return null;
};
