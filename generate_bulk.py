import csv
import random

features = ['age', 'workclass', 'education', 'occupation', 'hours-per-week']
workclasses = ['Private', 'Self-emp-not-inc', 'Self-emp-inc', 'Federal-gov', 'Local-gov', 'State-gov', 'Without-pay', 'Never-worked']
educations = ['Bachelors', 'Some-college', '11th', 'HS-grad', 'Prof-school', 'Assoc-acdm', 'Assoc-voc', '9th', '7th-8th', '12th', 'Masters', '1st-4th', '10th', 'Doctorate', '5th-6th', 'Preschool']
occupations = ['Tech-support', 'Craft-repair', 'Other-service', 'Sales', 'Exec-managerial', 'Prof-specialty', 'Handlers-cleaners', 'Machine-op-inspct', 'Adm-clerical', 'Farming-fishing', 'Transport-moving', 'Priv-house-serv', 'Protective-serv', 'Armed-Forces']

with open('bulk_demo_400.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(features)
    for _ in range(400):
        writer.writerow([
            random.randint(18, 75),
            random.choice(workclasses),
            random.choice(educations),
            random.choice(occupations),
            random.randint(10, 80)
        ])

print("Generated bulk_demo_400.csv")
