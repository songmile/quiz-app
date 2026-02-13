package com.quizgen.app.drill.controller;

import com.quizgen.app.common.api.ApiResponse;
import com.quizgen.app.drill.service.DrillService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/drill")
public class DrillController {

    private final DrillService drillService;

    public DrillController(DrillService drillService) {
        this.drillService = drillService;
    }

    @PostMapping("/start")
    public ApiResponse<Map<String, Object>> start(@RequestBody(required = false) Map<String, Object> body) {
        int count = 20;
        if (body != null && body.get("count") != null) {
            count = Integer.parseInt(Objects.toString(body.get("count")));
        }
        return ApiResponse.ok(drillService.startDrill(count));
    }

    @GetMapping("/analysis")
    public ApiResponse<Object> analysis() {
        return ApiResponse.ok(drillService.analyzeWeakness().get("categoryWeakness"));
    }
}

