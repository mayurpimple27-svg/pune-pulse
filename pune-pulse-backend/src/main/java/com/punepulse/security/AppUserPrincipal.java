package com.punepulse.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;
import java.util.UUID;

@Getter
public class AppUserPrincipal extends User {

    private final UUID userId;

    public AppUserPrincipal(UUID userId, String username, String password,
                            Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
        this.userId = userId;
    }
}
