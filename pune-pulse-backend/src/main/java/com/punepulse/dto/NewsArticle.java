package com.punepulse.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticle {
    private String title;
    private String summary;
    private String source;
    private String url;
    private String published;
    private String category;
    private String area;
}
