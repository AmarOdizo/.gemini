const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "PetCare Tele-Veterinary Platform API",
    version: "1.0.0",
    description: `
### Complete RESTful API Suite for PetCare Tele-Veterinary Network

This Swagger documentation provides interactive testing and reference for all backend endpoints.
- **Database Architecture**: Persistent business documents are stored in **MongoDB Atlas** (\`gemini_api\`).
- **Realtime Video & Chat**: Live calling WebRTC signaling & message streaming are managed through **Supabase / PostgreSQL**.
    `,
    contact: {
      name: "PetCare Engineering & Clinical Admin Team",
      email: "admin@petcare.org"
    }
  },
  servers: [
    {
      url: "http://localhost:5001",
      description: "Local Development Server"
    },
    {
      url: "https://odizopetcare.onrender.com",
      description: "Production Cloud Server (Render)"
    }
  ],
  tags: [
    { name: "Admin Operations", description: "Clinical governance, KPIs, practitioner verification, and platform audits" },
    { name: "Authentication", description: "Pet owner & user registration, authentication, and session handling" },
    { name: "Veterinarians", description: "Practitioner profiles, licenses, specialization, and availability" },
    { name: "Pets & Patients", description: "Pet registration, breed, vaccination history, and 15-digit Microchip IDs" },
    { name: "Appointments & Triage", description: "Consultation bookings, auto-triage prioritization (routine, urgent, emergency)" },
    { name: "Clinical Consultations", description: "Live session rooms, clinical history, and tentative diagnoses" },
    { name: "Electronic Prescriptions", description: "Digital RX generation, medication dosages, and pharmacy audit logs" },
    { name: "Live Chat & Messaging", description: "Realtime messaging between pet owners and veterinarians" },
    { name: "System Health", description: "API status and server diagnostics" }
  ],
  paths: {
    "/api/health": {
      get: {
        tags: ["System Health"],
        summary: "Check API Health Status",
        description: "Returns server uptime, environment, and connectivity status.",
        responses: {
          200: {
            description: "Server is healthy and running",
            content: {
              "application/json": {
                example: { status: "ok", uptime: "99.98%", timestamp: "2026-09-10T10:30:00.000Z" }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================
    "/api/admin/metrics": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get Overall Platform Metrics & KPIs",
        description: "Calculates total registered owners, veterinarians, pending reviews, active consultations, and ratings directly from MongoDB collections.",
        responses: {
          200: {
            description: "Live platform KPIs",
            content: {
              "application/json": {
                example: {
                  success: true,
                  metrics: {
                    totalOwners: { value: 8, trend: "+12.4%", subtext: "312 this week" },
                    veterinarians: { value: 9, verifiedPercentage: "98.2%", pendingReview: 2 },
                    pendingReview: { value: 2, fastTrack: 2, isAlert: true },
                    appointments: { value: 26, trend: "+8.1%", todayCount: 284 },
                    liveConsultations: { value: 2, encrypted: true, activePercentage: "100%" },
                    satisfaction: { rating: 4.92, score: "98.6%", totalRatings: 1240 }
                  }
                }
              }
            }
          }
        }
      }
    },

    "/api/admin/appointments": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get All Appointments for Clinical Dashboard",
        description: "Returns all appointment documents from the MongoDB `appointments` collection with triage priority and live status.",
        responses: {
          200: {
            description: "List of all appointments",
            content: {
              "application/json": {
                example: {
                  success: true,
                  count: 26,
                  appointments: [
                    {
                      _id: "66e01...",
                      vetName: "Dr. Marcus Sterling",
                      petName: "Barnaby",
                      ownerName: "Eleanor Vance",
                      triage: "urgent",
                      status: "live",
                      isLive: true,
                      date: "2026-09-10",
                      time: "10:00 AM EST",
                      reason: "Post-operative monitoring and appetite check"
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },

    "/api/admin/vets": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get All Veterinarians in Database",
        description: "Returns all practitioner records from MongoDB `vets` collection including license credentials and verification status.",
        responses: {
          200: {
            description: "List of veterinarians",
            content: {
              "application/json": {
                example: {
                  success: true,
                  count: 9,
                  vets: [
                    {
                      _id: "66e02...",
                      name: "Dr. Jonathan Blake, DVM",
                      email: "dr.blake@oakridgevet.com",
                      licenseNumber: "VET-CA-90421",
                      status: "pending",
                      isVerified: false,
                      clinicName: "Oak Ridge Animal Hospital",
                      specialization: ["Internal Medicine"]
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },

    "/api/admin/vets/{id}/verify": {
      put: {
        tags: ["Admin Operations"],
        summary: "Verify or Reject a Veterinarian",
        description: "Allows Admin to approve, reject, or suspend a practitioner's license in MongoDB `vets` collection.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "MongoDB ObjectID of the Veterinarian",
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                action: "approve",
                reason: "Valid State Veterinary Board registration verified",
                verifiedBy: "Chief Clinical Admin"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Verification status updated",
            content: {
              "application/json": {
                example: {
                  success: true,
                  message: "Veterinarian status updated to active.",
                  vet: { _id: "66e02...", isVerified: true, status: "active" }
                }
              }
            }
          }
        }
      }
    },

    "/api/admin/owners": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get All Pet Owners & Their Pets",
        description: "Queries MongoDB `users` with role `owner` and populates their registered pets from `pets` collection with Microchip IDs.",
        responses: {
          200: {
            description: "List of owners and their registered pets",
            content: {
              "application/json": {
                example: {
                  success: true,
                  count: 8,
                  owners: [
                    {
                      id: "66e03...",
                      name: "Eleanor Vance",
                      email: "eleanor.vance@example.com",
                      phone: "+1 (555) 432-8901",
                      totalConsultations: 8,
                      pets: [
                        { name: "Barnaby", species: "Dog", breed: "Golden Retriever", microchip: "985141002349182", vaccinated: true }
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },

    "/api/admin/prescriptions": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get All Electronic Prescriptions",
        description: "Returns digital prescriptions from MongoDB `prescriptions` collection for pharmacy audits.",
        responses: {
          200: {
            description: "List of prescriptions",
            content: {
              "application/json": {
                example: {
                  success: true,
                  count: 9,
                  prescriptions: [
                    {
                      _id: "66e04...",
                      patientName: "Barnaby",
                      petParent: "Eleanor Vance",
                      vetName: "Dr. Marcus Sterling",
                      diagnosis: "Abdominal Post-Op Recovery",
                      medications: [{ name: "Amoxicillin 250mg", dosage: "250mg", frequency: "Every 12 hrs" }]
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },

    "/api/admin/reports": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get Clinical Compliance & Operational Reports",
        description: "Fetches regulatory compliance audits, triage resolution metrics, and DEA logs from MongoDB `clinicalreports`.",
        responses: {
          200: {
            description: "List of clinical reports",
            content: {
              "application/json": {
                example: {
                  success: true,
                  reports: [
                    {
                      _id: "66e05...",
                      title: "Monthly Telehealth Practice Compliance Audit (Q4 2023)",
                      reportType: "compliance",
                      department: "all",
                      fileFormat: "PDF",
                      fileSize: "2.4 MB"
                    }
                  ]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Admin Operations"],
        summary: "Create New Operational Report",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                title: "Annual Controlled Substance Audit 2024",
                reportType: "pharmacy_audit",
                department: "internal_medicine",
                period: "Annual",
                fileFormat: "PDF",
                fileSize: "1.5 MB"
              }
            }
          }
        },
        responses: {
          201: { description: "Report created successfully" }
        }
      }
    },

    "/api/admin/advisories": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get Clinical Health Advisories",
        description: "Fetches health alerts from MongoDB `clinicaladvisories` collection.",
        responses: {
          200: {
            description: "List of advisories",
            content: {
              "application/json": {
                example: {
                  success: true,
                  advisories: [
                    {
                      _id: "66e06...",
                      title: "Canine Respiratory Disease Protocol Advisory",
                      message: "Elevated cases of atypical canine respiratory disease reported.",
                      urgency: "high",
                      active: true
                    }
                  ]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Admin Operations"],
        summary: "Broadcast New Health Advisory",
        description: "Saves a new advisory to MongoDB and broadcasts alert across platform.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                title: "Avian Flu Precautionary Protocol",
                message: "Ensure strict intake screening for domestic fowls and avian pets.",
                urgency: "emergency",
                targetAudience: "veterinarians",
                regions: ["All Active Regions"]
              }
            }
          }
        },
        responses: {
          201: { description: "Advisory broadcasted and saved in MongoDB" }
        }
      }
    },

    "/api/admin/notifications": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get Admin Notifications & Alerts",
        description: "Returns urgent alerts, triage notifications, and audit warnings from `adminnotifications` collection.",
        responses: {
          200: {
            description: "List of admin notifications",
            content: {
              "application/json": {
                example: {
                  success: true,
                  notifications: [
                    {
                      _id: "66e07...",
                      title: "Urgent Triage Request",
                      description: "Canine respiratory distress reported in Seattle region.",
                      type: "error",
                      urgency: "emergency",
                      isRead: false
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },

    "/api/admin/settings": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get Platform Settings",
        description: "Returns global configuration from MongoDB `platformsettings` collection.",
        responses: {
          200: {
            description: "Platform settings",
            content: {
              "application/json": {
                example: {
                  success: true,
                  settings: {
                    platformName: "PetCare Tele-Veterinary Network",
                    emergencyHotline: "+1 (800) 555-PETCARE",
                    autoTriageEnabled: true,
                    consultationFee: 45
                  }
                }
              }
            }
          }
        }
      },
      put: {
        tags: ["Admin Operations"],
        summary: "Update Platform Settings",
        description: "Updates global platform configuration in MongoDB `platformsettings` collection.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                platformName: "PetCare Tele-Veterinary Network",
                emergencyHotline: "+1 (800) 555-PETCARE",
                autoTriageEnabled: true,
                consultationFee: 50
              }
            }
          }
        },
        responses: {
          200: { description: "Platform settings updated successfully" }
        }
      }
    },

    "/api/admin/reviews": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get Doctor Testimonials & Ratings",
        description: "Fetches reviews from MongoDB `reviews` collection.",
        responses: {
          200: {
            description: "List of reviews",
            content: {
              "application/json": {
                example: {
                  success: true,
                  reviews: [
                    {
                      _id: "66e08...",
                      vetName: "Dr. Marcus Sterling",
                      ownerName: "Eleanor Vance",
                      petName: "Barnaby",
                      rating: 5,
                      comment: "Dr. Sterling was compassionate and patient throughout the call."
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },

    "/api/admin/telemetry/{appointmentId}": {
      get: {
        tags: ["Admin Operations"],
        summary: "Get Live WebRTC Call Diagnostics",
        description: "Returns bitrate, latency, packet loss, and encryption metrics from MongoDB `consultationtelemetries` collection.",
        parameters: [
          {
            name: "appointmentId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        responses: {
          200: {
            description: "Telemetry details",
            content: {
              "application/json": {
                example: {
                  success: true,
                  telemetry: {
                    appointmentId: "APT-1092",
                    streamMetrics: {
                      vetBitrateKbps: 1800,
                      ownerBitrateKbps: 1200,
                      latencyMs: 28,
                      packetLossPercentage: 0.02,
                      resolution: "1080p @ 30fps",
                      encryption: "AES-256"
                    },
                    durationSeconds: 872,
                    webrtcState: "connected"
                  }
                }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // AUTHENTICATION ENDPOINTS
    // ==========================================
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register Pet Owner Account",
        description: "Creates a new user record in MongoDB `users` collection.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Sarah Parker",
                email: "sarah.parker@example.com",
                password: "StrongPassword123!",
                phone: "+1 (555) 789-4321"
              }
            }
          }
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Invalid input or user already exists" }
        }
      }
    },

    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Pet Owner Login",
        description: "Authenticates email and password, returns JWT token.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "eleanor.vance@example.com",
                password: "securePassword123!"
              }
            }
          }
        },
        responses: {
          200: { description: "Login successful with token" },
          401: { description: "Invalid credentials" }
        }
      }
    },

    // ==========================================
    // VETERINARIANS ENDPOINTS
    // ==========================================
    "/api/vets": {
      get: {
        tags: ["Veterinarians"],
        summary: "List All Veterinarians",
        description: "Retrieves active/verified veterinary practitioners from MongoDB `vets`.",
        responses: {
          200: { description: "List of practitioners" }
        }
      }
    },

    "/api/vets/login": {
      post: {
        tags: ["Veterinarians"],
        summary: "Doctor Portal Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                email: "m.sterling@sterlingvet.com",
                password: "securePassword123!"
              }
            }
          }
        },
        responses: {
          200: { description: "Doctor login successful" }
        }
      }
    },

    // ==========================================
    // PETS ENDPOINTS
    // ==========================================
    "/api/pets": {
      get: {
        tags: ["Pets & Patients"],
        summary: "Get All Registered Pets",
        description: "Returns pets with breed, age, and 15-digit Microchip ID from MongoDB `pets` collection.",
        responses: {
          200: { description: "List of registered pets" }
        }
      },
      post: {
        tags: ["Pets & Patients"],
        summary: "Register New Pet",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "Cooper",
                species: "Dog",
                breed: "Labrador Retriever",
                age: 3,
                weight: 28,
                microchipId: "985141009988776",
                ownerName: "Eleanor Vance"
              }
            }
          }
        },
        responses: {
          201: { description: "Pet registered successfully in MongoDB" }
        }
      }
    },

    // ==========================================
    // APPOINTMENTS ENDPOINTS
    // ==========================================
    "/api/appointments": {
      get: {
        tags: ["Appointments & Triage"],
        summary: "List Appointments",
        parameters: [
          { name: "vetId", in: "query", schema: { type: "string" }, description: "Filter by Doctor ID" },
          { name: "ownerId", in: "query", schema: { type: "string" }, description: "Filter by Owner ID" }
        ],
        responses: {
          200: { description: "List of appointments" }
        }
      },
      post: {
        tags: ["Appointments & Triage"],
        summary: "Book Telehealth Appointment",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                vetId: "VET-003",
                vetName: "Dr. Marcus Sterling",
                petName: "Barnaby",
                ownerName: "Eleanor Vance",
                date: "2026-09-10",
                time: "02:00 PM",
                reason: "Routine postoperative recovery inspection",
                triage: "routine"
              }
            }
          }
        },
        responses: {
          201: { description: "Appointment booked and saved to MongoDB" }
        }
      }
    },

    // ==========================================
    // DIGITAL PRESCRIPTIONS
    // ==========================================
    "/api/prescriptions": {
      get: {
        tags: ["Electronic Prescriptions"],
        summary: "List Prescriptions",
        responses: {
          200: { description: "List of prescriptions from MongoDB" }
        }
      },
      post: {
        tags: ["Electronic Prescriptions"],
        summary: "Issue New Prescription",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                patientName: "Barnaby",
                petParent: "Eleanor Vance",
                diagnosis: "Post-op abdominal incision prophylaxis",
                medications: [
                  { name: "Cephalexin 500mg", dosage: "500mg", frequency: "Every 12 hrs", duration: "10 days" }
                ]
              }
            }
          }
        },
        responses: {
          201: { description: "Prescription recorded in MongoDB" }
        }
      }
    },

    // ==========================================
    // LIVE CHAT
    // ==========================================
    "/api/chat/{conversationId}": {
      get: {
        tags: ["Live Chat & Messaging"],
        summary: "Get Consultation Chat History",
        parameters: [
          { name: "conversationId", in: "path", required: true, schema: { type: "string" } }
        ],
        responses: {
          200: { description: "Chat messages for consultation" }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
