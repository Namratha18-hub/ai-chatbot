FROM eclipse-temurin:21-jdk

WORKDIR /app

RUN printf '%s\n' \
'import java.net.Socket;' \
'public class NetTest {' \
'  public static void main(String[] args) throws Exception {' \
'    System.out.println("TESTING AIVEN CONNECTION...");' \
'    try (Socket socket = new Socket("34.35.142.105", 22467)) {' \
'      System.out.println("AIVEN_CONNECTION_SUCCESS");' \
'    } catch (Exception e) {' \
'      System.out.println("AIVEN_CONNECTION_FAILED");' \
'      e.printStackTrace();' \
'      System.exit(1);' \
'    }' \
'  }' \
'}' > NetTest.java

RUN javac NetTest.java

CMD ["java", "NetTest"]