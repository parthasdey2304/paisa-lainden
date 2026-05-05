import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Replace with your actual Supabase URL and Anon Key when running
//   await Supabase.initialize(
//     url: 'YOUR_SUPABASE_URL',
//     anonKey: 'YOUR_SUPABASE_ANON_KEY',
//   );

  runApp(const StudentManagerApp());
}

class StudentManagerApp extends StatelessWidget {
  const StudentManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => StudentProvider(),
      child: MaterialApp(
        title: 'Student Manager',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.pink,
            surface: const Color(0xFFFDFBC8),
            primary: Colors.pinkAccent,
            secondary: Colors.cyan,
          ),
          useMaterial3: true,
          fontFamily: 'Space Grotesk',
          cardTheme: CardTheme(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(0),
              side: const BorderSide(color: Colors.black, width: 3),
            ),
            elevation: 6,
            shadowColor: Colors.black,
            clipBehavior: Clip.antiAlias,
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(0)),
              side: const BorderSide(color: Colors.black, width: 2),
            ),
          )
        ),
        home: const MainNavigationScreen(),
      ),
    );
  }
}

// -------------------------------------------------------------
// Models
// -------------------------------------------------------------
class Payment {
  final String id;
  final String studentId;
  final int amount;
  final DateTime date;
  final String monthKey;
  final String paymentMethod;

  Payment({required this.id, required this.studentId, required this.amount, required this.date, required this.monthKey, required this.paymentMethod});

  factory Payment.fromJson(Map<String, dynamic> json) => Payment(
    id: json['id'],
    studentId: json['student_id'],
    amount: json['amount'],
    date: DateTime.parse(json['payment_date']),
    monthKey: json['month_key'],
    paymentMethod: json['payment_method'] ?? 'offline',
  );
}

class Student {
  final String id;
  final String name;
  final String? email;
  final String phone;
  final int subjects;
  final int monthlyFee;
  final String? classYear;
  final List<Payment> payments;

  Student({required this.id, required this.name, this.email, required this.phone, required this.subjects, required this.monthlyFee, this.classYear, required this.payments});

  factory Student.fromJson(Map<String, dynamic> json, List<Payment> payments) => Student(
    id: json['id'],
    name: json['name'],
    email: json['email'],
    phone: json['phone'],
    subjects: json['subjects'] ?? 1,
    monthlyFee: json['monthly_fee'],
    classYear: json['class_year'],
    payments: payments,
  );
}

// -------------------------------------------------------------
// Provider
// -------------------------------------------------------------
class StudentProvider extends ChangeNotifier {
  List<Student> students = [];
  bool isLoading = false;

  StudentProvider() {
    fetchStudents();
  }

  String get currentMonthKey => "\${DateTime.now().year}-\${DateTime.now().month.toString().padLeft(2, '0')}";

  Future<void> fetchStudents() async {
    isLoading = true;
    notifyListeners();
    try {
      final supabase = Supabase.instance.client;
      final studentsData = await supabase.from('students').select('*');
      final paymentsData = await supabase.from('payments').select('*');

      final List<Payment> allPayments = (paymentsData as List).map((p) => Payment.fromJson(p)).toList();
      students = (studentsData as List).map((s) {
        final studentPayments = allPayments.where((p) => p.studentId == s['id']).toList();
        return Student.fromJson(s, studentPayments);
      }).toList();
    } catch (e) {
      debugPrint('Supabase not initialized or error: \$e');
      // Dummy data fallback for UI demonstration before connecting real Supabase
      students = []; 
    }
    isLoading = false;
    notifyListeners();
  }

  Future<void> addStudent(Map<String, dynamic> data) async {
    try {
      final supabase = Supabase.instance.client;
      await supabase.from('students').insert({
        'name': data['name'],
        'phone': data['phone'],
        'email': data['email'],
        'monthly_fee': int.parse(data['monthlyFee'].toString()),
        'subjects': int.parse(data['subjects'].toString()),
        'class_year': data['classYear'],
      });
      fetchStudents();
    } catch (e) { debugPrint(e.toString()); }
  }

  Future<void> addPayment(String studentId, int amount, DateTime date, String method) async {
    try {
      final monthKey = "\${date.year}-\${date.month.toString().padLeft(2, '0')}";
      final supabase = Supabase.instance.client;
      await supabase.from('payments').insert({
        'student_id': studentId,
        'amount': amount,
        'payment_date': DateFormat('yyyy-MM-dd').format(date),
        'month_key': monthKey,
        'payment_method': method
      });
      fetchStudents();
    } catch (e) { debugPrint(e.toString()); }
  }

  int get totalStudents => students.length;
  int get totalExpectedFees => students.fold(0, (sum, s) => sum + s.monthlyFee);
  int get collectedThisMonth => students.fold(0, (sum, s) {
    final thisMonthPayments = s.payments.where((p) => p.monthKey == currentMonthKey);
    return sum + thisMonthPayments.fold(0, (pSum, p) => pSum + p.amount);
  });
  int get pendingFees => (totalExpectedFees - collectedThisMonth) > 0 ? (totalExpectedFees - collectedThisMonth) : 0;
  int get totalRevenue => students.fold(0, (sum, s) => sum + s.payments.fold(0, (pSum, p) => pSum + p.amount));
  
  List<Student> get pendingStudents {
    return students.where((s) {
      final paidThisMonth = s.payments.where((p) => p.monthKey == currentMonthKey).fold(0, (sum, p) => sum + p.amount);
      return paidThisMonth < s.monthlyFee;
    }).toList();
  }
}

// -------------------------------------------------------------
// UI Navigation
// -------------------------------------------------------------
class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  final List<Widget> _screens = [const DashboardScreen(), const StudentsScreen()];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.monitor_weight_outlined, color: Colors.black),
            SizedBox(width: 8),
            Text('STUDENTMANAGER', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
          ],
        ),
        backgroundColor: Colors.white,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(3.0),
          child: Container(color: Colors.black, height: 3.0),
        ),
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Colors.black, width: 3)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          selectedItemColor: Colors.black,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold),
          unselectedItemColor: Colors.black54,
          backgroundColor: Colors.white,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'DASHBOARD'),
            BottomNavigationBarItem(icon: Icon(Icons.people), label: 'STUDENTS'),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// Dashboard Screen
// -------------------------------------------------------------
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<StudentProvider>();
    final showNotification = DateTime.now().day >= 5 && provider.pendingStudents.isNotEmpty;

    return provider.isLoading 
      ? const Center(child: CircularProgressIndicator())
      : ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('OVERVIEW', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            
            if (showNotification)
              Card(
                color: Colors.yellowAccent,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.warning_amber_rounded),
                          SizedBox(width: 8),
                          Text('FEE COLLECTION REMINDER!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text('It is past the 5th of the month. The following students have pending fees:'),
                      const Divider(color: Colors.black),
                      ...provider.pendingStudents.map((s) {
                        final paid = s.payments.where((p) => p.monthKey == provider.currentMonthKey).fold(0, (sum, p) => sum + p.amount);
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text("\${s.name} - \${s.phone}", style: const TextStyle(fontWeight: FontWeight.bold)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                color: Colors.redAccent,
                                child: Text('Pending: ₹\${s.monthlyFee - paid}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              )
                            ],
                          ),
                        );
                      }).toList(),
                    ],
                  ),
                ),
              ),

            _buildStatCard('TOTAL STUDENTS', "\${provider.totalStudents}", Colors.white, Icons.people),
            _buildStatCard('COLLECTED THIS MONTH', '₹\${provider.collectedThisMonth}', Colors.greenAccent, Icons.trending_up),
            _buildStatCard('PENDING THIS MONTH', '₹\${provider.pendingFees}', Colors.redAccent, Icons.warning),
            _buildStatCard('EXPECTED (MONTHLY)', '₹\${provider.totalExpectedFees}', Colors.purpleAccent, Icons.credit_card),
            _buildStatCard('TOTAL REVENUE (ALL TIME)', '₹\${provider.totalRevenue}', Colors.cyanAccent, Icons.account_balance_wallet),
          ],
        );
  }

  Widget _buildStatCard(String title, String value, Color color, IconData icon) {
    return Card(
      color: color,
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(border: Border.all(color: Colors.black, width: 2), color: Colors.white),
              child: Icon(icon, size: 32),
            ),
            const SizedBox(width: 20),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: -1)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  decoration: BoxDecoration(border: Border.all(color: Colors.black, width: 1), color: Colors.white),
                  child: Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// Students Screen
// -------------------------------------------------------------
class StudentsScreen extends StatelessWidget {
  const StudentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<StudentProvider>();

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: provider.students.length,
        itemBuilder: (context, index) {
          final student = provider.students[index];
          return Card(
            color: Colors.white,
            margin: const EdgeInsets.only(bottom: 16),
            child: ListTile(
              title: Text(student.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              subtitle: Text("\${student.phone} • Class \${student.classYear ?? 'N/A'}\nFee: ₹\${student.monthlyFee}"),
              trailing: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.greenAccent),
                onPressed: () => _showPaymentDialog(context, student, provider),
                child: const Text('PAY', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
              ),
              isThreeLine: true,
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddStudentDialog(context, provider),
        backgroundColor: Colors.black,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(0)),
        label: const Text('ADD STUDENT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        icon: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  void _showPaymentDialog(BuildContext context, Student student, StudentProvider provider) {
    final amountCtrl = TextEditingController(text: student.monthlyFee.toString());
    String method = 'offline';

    showDialog(context: context, builder: (ctx) {
      return AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(0), side: const BorderSide(width: 3)),
        title: Text('Record Payment for \${student.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: amountCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Amount (₹)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: method,
              decoration: const InputDecoration(labelText: 'Method', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'offline', child: Text('Offline / Cash')),
                DropdownMenuItem(value: 'online', child: Text('Online / UPI')),
              ],
              onChanged: (v) => method = v!,
            )
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
          ElevatedButton(
            onPressed: () {
              provider.addPayment(student.id, int.parse(amountCtrl.text), DateTime.now(), method);
              Navigator.pop(ctx);
            },
            child: const Text('RECORD PAYMENT'),
          )
        ],
      );
    });
  }

  void _showAddStudentDialog(BuildContext context, StudentProvider provider) {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final feeCtrl = TextEditingController();
    final classCtrl = TextEditingController();

    showDialog(context: context, builder: (ctx) {
      return AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(0), side: const BorderSide(width: 3)),
        title: const Text('Add New Student'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: phoneCtrl, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: classCtrl, decoration: const InputDecoration(labelText: 'Class/Year', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: feeCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Monthly Fee (₹)', border: OutlineInputBorder())),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
          ElevatedButton(
            onPressed: () {
              provider.addStudent({
                'name': nameCtrl.text,
                'phone': phoneCtrl.text,
                'email': '',
                'subjects': 1,
                'monthlyFee': feeCtrl.text,
                'classYear': classCtrl.text,
              });
              Navigator.pop(ctx);
            },
            child: const Text('ADD STUDENT'),
          )
        ],
      );
    });
  }
}
