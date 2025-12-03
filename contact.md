---
layout: page
title: Contact
permalink: /contact/
description: Get in touch with Aidan Bevan for gymnastics coaching inquiries. Serving Pinetown and surrounding areas with specialized programs for young children of all abilities.
---

<div class="contact-form-container">
  <div class="contact-intro">
    <h1>Get in Touch</h1>
    <p>Have questions about gymnastics coaching? Want to learn more about my programs? The quickest way to reach me is via WhatsApp!</p>
  </div>

  <div class="whatsapp-section">
    <a href="https://wa.me/{{ site.whatsapp.number | remove: '+' }}" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
      <svg class="whatsapp-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Message me on WhatsApp
    </a>
  </div>

  <div class="contact-divider">
    <span>or use the form below</span>
  </div>

  <form action="https://formspree.io/f/xrbnkeql" method="POST" class="contact-form">
    <div class="form-group">
      <label for="name">Name <span class="required">*</span></label>
      <input type="text" id="name" name="name" required>
    </div>

    <div class="form-group">
      <label for="email">Email <span class="required">*</span></label>
      <input type="email" id="email" name="email" required>
    </div>

    <div class="form-group">
      <label for="phone">Phone Number</label>
      <input type="tel" id="phone" name="phone">
    </div>

    <div class="form-group">
      <label for="subject">Subject <span class="required">*</span></label>
      <select id="subject" name="subject" required>
        <option value="">Select a subject...</option>
        <option value="General Inquiry">General Inquiry</option>
        <option value="Coaching Services">Coaching Services</option>
        <option value="Private Lessons">Private Lessons</option>
        <option value="Group Classes">Group Classes</option>
        <option value="Other">Other</option>
      </select>
    </div>

    <div class="form-group">
      <label for="message">Message <span class="required">*</span></label>
      <textarea id="message" name="message" rows="6" required></textarea>
    </div>

    <button type="submit" class="btn btn-primary">Send Message</button>
  </form>

  <div class="contact-alternative">
    <p>Prefer to email directly? Reach me at <a href="mailto:aidanbevan09@gmail.com">aidanbevan09@gmail.com</a></p>
  </div>
</div>
