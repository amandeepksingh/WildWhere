import 'dart:math';
import 'package:flutter/material.dart';
import 'package:wildwhere/database.dart';
import 'package:wildwhere/post.dart';
import 'package:wildwhere/location.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:geolocator/geolocator.dart';

class StatsPage extends StatefulWidget {
  StatsPage({super.key});

  @override
  State<StatsPage> createState() => _StatsPageState();
}

class _StatsPageState extends State<StatsPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SingleChildScrollView(
      child: Center(
          child: Column(
        children: [
          const SizedBox(height: 10),
          //page title
          const Text(
            'Your Local Sighting Statistics',
            style: TextStyle(fontSize: 20, fontFamily: 'Open Sans'),
          ),
          const SizedBox(height: 10),
          //pie chart of animal activity
          SizedBox(
              width: MediaQuery.of(context).size.width * 0.7,
              height: MediaQuery.of(context).size.height * 0.35,
              child: pieChart('activity')),
          const SizedBox(height: 10),
          const Text("Activity Chart"),
          const SizedBox(height: 20),
          //pie chart of all animals observed
          SizedBox(
              width: MediaQuery.of(context).size.width * 0.7,
              height: MediaQuery.of(context).size.height * 0.35,
              child: pieChart('animalName')),
          const SizedBox(height: 10),
          const Text("Animals Observed"),
          const SizedBox(height: 30),
          //bar chart of sightings each month
          SizedBox(
            width: MediaQuery.of(context).size.width * 0.8,
            height: MediaQuery.of(context).size.height * 0.35,
            child: barChart(),
          ),
          const SizedBox(height: 20),
          const Text("Number of Sightings Each Month"),
        ],
      )),
    ));
  }

  FutureBuilder<List<Post>> pieChart(String field) {
    Future<Position> currentPositionFuture = Location().getCurrentLocation();

    return FutureBuilder<List<Post>>(
      //return all posts at radius of 3 miles from currPos
      future: currentPositionFuture.then((currentPosition) {
        return Database().getPostsInRadius(3, currentPosition);
      }),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const CircularProgressIndicator();
        }
        if (snapshot.hasError) {
          return Text('Error: ${snapshot.error}');
        }
        List<Post> posts = snapshot.data ?? [];

        //total number of animals seen from all posts
        int totalQuantity = posts.fold(0, (sum, post) => sum + post.quantity);

        Map<String, double> activityPercentages = {};
        //if param 'activity' make pie chart with activity
        if (field == 'activity') {
          posts.forEach((post) {
            activityPercentages[post.activity] =
                (activityPercentages[post.activity] ?? 0) +
                    (post.quantity / totalQuantity);
          });
          //pie chart for animals observed
        } else {
          posts.forEach((post) {
            activityPercentages[post.animalName ?? 'N/A'] =
                (activityPercentages[post.animalName ?? 'N/A'] ?? 0) +
                    (post.quantity / totalQuantity);
          });
        }

        List<PieChartSectionData> sectionData =
            activityPercentages.entries.map((entry) {
          return PieChartSectionData(
              title: entry.key,
              value: entry.value * 100,
              color: getRandomColor(),
              titleStyle: const TextStyle(
                fontSize: 12,
              ));
        }).toList();

        return PieChart(
          PieChartData(
            borderData: FlBorderData(
              show: true,
            ),
            sections: sectionData.map((data) {
              //make pie chart more readable with ellipses
              String title = data.title.length > 13
                  ? '${data.title.substring(0, 13)}...'
                  : data.title;
              return data.copyWith(title: title);
            }).toList(),
            sectionsSpace: 15,
            centerSpaceRadius: 130,
            startDegreeOffset: 150,
          ),
        );
      },
    );
  }

  FutureBuilder<List<Post>> barChart() {
    return FutureBuilder<List<Post>>(
        future: Database().getAllPosts(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const CircularProgressIndicator();
          }
          if (snapshot.hasError) {
            return Text('Error: ${snapshot.error}');
          }
          List<Post> posts = snapshot.data ?? [];

          Map<int, int> monthCount = {for (int i = 0; i < 12; i++) i: 0};

          //convert all time data into DateTime object
          posts.forEach((post) {
            DateTime dateTime = DateTime.parse(post.datetime);
            int month = dateTime.month - 1;
            monthCount[month] = monthCount[month]! + post.quantity;
          });

          List<BarChartGroupData> barData = monthCount.entries.map((entry) {
            return BarChartGroupData(
              x: entry.key,
              barRods: [
                BarChartRodData(
                  fromY: 0,
                  toY: entry.value.toDouble(),
                  color: const Color.fromARGB(255, 15, 77, 53),
                ),
              ],
            );
          }).toList();

          return BarChart(BarChartData(
            barGroups: barData,
            alignment: BarChartAlignment.spaceAround,
            //max y val rounded to closest (higher) multiple of five
            maxY: (monthCount.values.reduce((a, b) => a > b ? a : b)/5).ceil() * 5).toDouble(),
            groupsSpace: 11,
            titlesData: FlTitlesData(
                show: true,
                topTitles:
                    const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                leftTitles: AxisTitles(
                  axisNameWidget: const Text("Animals Sighted"),
                  sideTitles: SideTitles(
                    reservedSize: 50,
                    showTitles: true,
                    getTitlesWidget: quantityTitles,
                  ),
                ),
                rightTitles:
                    const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                    axisNameWidget: const Text("Months"),
                    sideTitles: SideTitles(
                      reservedSize: 40,
                      showTitles: true,
                      getTitlesWidget: monthNames,
                    ))),
            borderData: FlBorderData(
              show: true,
              border: Border.all(
                  color: Colors.black, width: 1.0, style: BorderStyle.solid),
            ),
          ));
        });
  }

//x-axis labels
  Widget monthNames(double value, TitleMeta meta) {
    final titles = <String>[
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];

    final Widget text = Text(
      titles[value.toInt()],
      style: const TextStyle(
        color: Colors.black,
        fontWeight: FontWeight.bold,
        fontSize: MediaQuery.of(context).size.width * 0.025,
      ),
    );

    return SideTitleWidget(
      axisSide: meta.axisSide,
      space: 16,
      child: text,
    );
  }

//y-axis labels
  Widget quantityTitles(double value, TitleMeta meta) {
    final Widget text = Text(
      value.toInt().toString(),
      style: const TextStyle(
        color: Colors.black,
        fontWeight: FontWeight.bold,
        fontSize: 14,
      ),
    );

    return SideTitleWidget(
      axisSide: meta.axisSide,
      space: 16,
      child: text,
    );
  }
}

Color getRandomColor() {
  return Color.fromRGBO(
    Random().nextInt(50) + 206,
    Random().nextInt(50) + 206,
    Random().nextInt(50) + 206,
    1,
  );
}
