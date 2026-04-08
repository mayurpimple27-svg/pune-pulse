package com.punepulse.dto;

import com.punepulse.entity.Role;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private Role role;
    private Instant createdAt;
}
