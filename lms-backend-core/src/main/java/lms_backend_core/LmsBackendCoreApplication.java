package lms_backend_core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import lms_backend_core.config.VnpayProperties;

@SpringBootApplication
@EnableConfigurationProperties(VnpayProperties.class)
public class LmsBackendCoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(LmsBackendCoreApplication.class, args);
	}

}
