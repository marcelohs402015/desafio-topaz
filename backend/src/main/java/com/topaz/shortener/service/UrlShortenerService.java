package com.topaz.shortener.service;

import com.topaz.shortener.dto.request.CreateUrlRequest;
import com.topaz.shortener.dto.request.UpdateUrlRequest;
import com.topaz.shortener.dto.response.UrlResponse;

import java.util.List;

public interface UrlShortenerService {

    UrlResponse create(CreateUrlRequest request);

    List<UrlResponse> list();

    UrlResponse update(Long id, UpdateUrlRequest request);

    void delete(Long id);

    String resolveOriginalUrl(String shortCode);
}
